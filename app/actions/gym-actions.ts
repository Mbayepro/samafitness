"use server";

import {
  getMembers,
  saveMember,
  deleteMember,
  getPayments,
  recordPayment,
  getAttendances,
  recordAttendance,
  getGymStats,
  getExpenses,
  recordExpense,
  softDeleteExpense,
  getMemberByQrToken,
  regenerateMemberQrToken,
  AttendanceError,
  type Member,
  type Payment,
  type Attendance,
  type GymStats,
  type PaymentMethod,
  type Expense,
  type ExpenseCategory,
} from "@/lib/gym-store";
import { updateLeadStatus } from "@/lib/leads-store";
import { AdminAuthError, requireAdmin, type AdminRole } from "@/lib/auth/admin";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";

export type ActionResult<T = object> =
  | ({ success: true } & T)
  | {
      success: false;
      error: string;
      isExpired?: boolean;
      isDuplicate?: boolean;
      memberId?: string;
      memberName?: string;
      checkInTime?: string;
    };

async function guarded<T extends object>(
  minRole: AdminRole,
  run: () => Promise<T>
): Promise<ActionResult<T>> {
  try {
    await requireAdmin(minRole);
    const data = await run();
    return { success: true, ...data };
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return { success: false, error: err.message };
    }
    if (err instanceof AttendanceError) {
      return {
        success: false,
        error: err.message,
        isExpired: err.isExpired,
        isDuplicate: err.isDuplicate,
        memberId: err.memberId,
        memberName: err.memberName,
        checkInTime: err.checkInTime,
      };
    }
    logger.error({ err }, "Erreur action gym");
    return { success: false, error: "Une erreur est survenue. Réessayez." };
  }
}

export interface GymDataResult {
  members: Member[];
  payments: Payment[];
  attendances: Attendance[];
  stats: GymStats;
  expenses: Expense[];
}

export async function fetchGymDataAction(): Promise<ActionResult<GymDataResult>> {
  return guarded("receptionist", async () => {
    const admin = await requireAdmin("receptionist");
    const [members, payments, attendances, stats, expenses] = await Promise.all([
      getMembers(),
      getPayments(),
      getAttendances(),
      getGymStats(),
      admin.role === "super_admin" ? getExpenses().catch(() => []) : Promise.resolve([]),
    ]);
    return { members, payments, attendances, stats, expenses };
  });
}

export async function saveMemberAction(
  data: Omit<Member, "id" | "status" | "created_at" | "updated_at"> & { id?: string }
): Promise<ActionResult<{ member: Member }>> {
  return guarded("receptionist", async () => {
    const { memberSchema } = await import("@/lib/validations/gym");
    const parsed = memberSchema.safeParse(data);
    if (!parsed.success) {
      throw new AdminAuthError(parsed.error.issues[0]?.message || "Données du membre invalides.");
    }

    const member = await saveMember(data);
    revalidatePath("/admin");
    return { member };
  });
}

export async function deleteMemberAction(id: string): Promise<ActionResult> {
  return guarded("super_admin", async () => {
    await deleteMember(id);
    revalidatePath("/admin");
    return {};
  });
}

export async function convertLeadToMemberAction(
  leadId: string,
  data: {
    full_name: string;
    phone: string;
    plan_id: string;
    duration_months: number;
    amount_fcfa?: number;
    payment_method?: PaymentMethod;
  }
): Promise<ActionResult<{ member: Member }>> {
  return guarded("receptionist", async () => {
    const { convertLeadSchema } = await import("@/lib/validations/gym");
    const parsed = convertLeadSchema.safeParse({ leadId, ...data });
    if (!parsed.success) {
      throw new AdminAuthError(parsed.error.issues[0]?.message || "Données de conversion invalides.");
    }

    const today = new Date();
    const startDateStr = today.toISOString().split("T")[0];

    const endDate = new Date(today);
    endDate.setMonth(endDate.getMonth() + (Number(data.duration_months) || 1));
    const endDateStr = endDate.toISOString().split("T")[0];

    // 1. Créer le membre
    const member = await saveMember({
      full_name: data.full_name,
      phone: data.phone,
      plan_id: data.plan_id || "mensuel",
      start_date: startDateStr,
      end_date: endDateStr,
      notes: "Converti depuis une demande de contact du site",
    });

    // 2. Enregistrer le paiement initial si spécifié
    if (data.amount_fcfa && data.payment_method) {
      await recordPayment({
        member_id: member.id,
        amount_fcfa: data.amount_fcfa,
        method: data.payment_method,
        period_start: startDateStr,
        period_end: endDateStr,
        note: `Paiement initial adhésion (${data.plan_id})`,
        recorded_by: "Admin",
      });
    }

    // 3. Mettre à jour le statut du lead en 'inscrit'
    await updateLeadStatus(leadId, "inscrit");

    revalidatePath("/admin");
    return { member };
  });
}

export async function recordPaymentAction(data: {
  member_id: string;
  amount_fcfa: number;
  method: PaymentMethod;
  period_start: string;
  period_end: string;
  note?: string;
}): Promise<ActionResult<{ payment: Payment; updatedMember: Member | null }>> {
  return guarded("receptionist", async () => {
    const { paymentSchema } = await import("@/lib/validations/gym");
    const parsed = paymentSchema.safeParse(data);
    if (!parsed.success) {
      throw new AdminAuthError(parsed.error.issues[0]?.message || "Données de paiement invalides.");
    }

    const admin = await requireAdmin("receptionist");
    const result = await recordPayment({
      ...data,
      recorded_by: admin.email,
    });

    revalidatePath("/admin");
    return result;
  });
}

export async function recordAttendanceAction(
  memberId: string,
  method: "manuel" | "qr_code" = "manuel"
): Promise<ActionResult<{ attendance: Attendance; isExpired: boolean; memberName: string }>> {
  return guarded("receptionist", async () => {
    const admin = await requireAdmin("receptionist");
    const res = await recordAttendance(memberId, admin.email, method);
    revalidatePath("/admin");
    return res;
  });
}

export async function recordExpenseAction(data: {
  amount_fcfa: number;
  category: ExpenseCategory;
  description?: string;
  paid_at: string;
}): Promise<ActionResult<{ expense: Expense }>> {
  return guarded("super_admin", async () => {
    const { expenseSchema } = await import("@/lib/validations/gym");
    const parsed = expenseSchema.safeParse(data);
    if (!parsed.success) {
      throw new AdminAuthError(
        parsed.error.issues[0]?.message || "Données de dépense invalides."
      );
    }

    const admin = await requireAdmin("super_admin");
    const expense = await recordExpense({
      ...data,
      created_by: admin.email,
    });

    revalidatePath("/admin");
    return { expense };
  });
}

export async function softDeleteExpenseAction(id: string): Promise<ActionResult> {
  return guarded("super_admin", async () => {
    if (!id || typeof id !== "string") {
      throw new AdminAuthError("Identifiant de dépense manquant.");
    }

    const admin = await requireAdmin("super_admin");
    await softDeleteExpense(id, admin.email);

    revalidatePath("/admin");
    return {};
  });
}

/**
 * Pointage par scan direct du jeton QR opaque (serveur = source de vérité).
 */
export async function checkInByQrTokenAction(
  qrToken: string
): Promise<ActionResult<{
  attendance: Attendance;
  member: Member;
  memberName: string;
  message: string;
}>> {
  return guarded("receptionist", async () => {
    const cleanToken = (qrToken || "").trim();
    if (!cleanToken) {
      throw new AdminAuthError("Jeton QR manquant ou invalide.");
    }

    const member = await getMemberByQrToken(cleanToken);
    if (!member) {
      throw new AdminAuthError("QR code non reconnu ou carte introuvable.");
    }

    const admin = await requireAdmin("receptionist");
    const res = await recordAttendance(member.id, admin.email, "qr_code");
    revalidatePath("/admin");

    return {
      attendance: res.attendance,
      member: res.member,
      memberName: res.memberName,
      message: `Entrée validée pour ${res.memberName} !`,
    };
  });
}

/**
 * Régénération d'un nouveau jeton QR opaque (invalide immédiatement l'ancien).
 */
export async function regenerateMemberQrTokenAction(
  memberId: string
): Promise<ActionResult<{ member: Member }>> {
  return guarded("receptionist", async () => {
    if (!memberId || typeof memberId !== "string") {
      throw new AdminAuthError("Identifiant de membre invalide.");
    }

    const member = await regenerateMemberQrToken(memberId);
    revalidatePath("/admin");
    return { member };
  });
}


