import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createJsonFileStore, mergeById, runSupabase } from "@/lib/sync-store";
import { logger } from "@/lib/logger";

export type MemberStatus = "actif" | "expire_bientot" | "expire";
export type PaymentMethod = "Espèces" | "Wave" | "Orange Money";

export interface Member {
  id: string;
  member_number?: number | null;
  full_name: string;
  phone: string;
  plan_id: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  status: MemberStatus;
  notes?: string | null;
  qr_token?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  member_id: string;
  amount_fcfa: number;
  method: PaymentMethod;
  period_start: string; // YYYY-MM-DD
  period_end: string;   // YYYY-MM-DD
  note?: string | null;
  recorded_by?: string | null;
  created_at: string;
  member_name?: string;
  member_phone?: string;
}

export interface Attendance {
  id: string;
  member_id: string;
  checked_in_at: string;
  recorded_by?: string | null;
  method: "manuel" | "qr_code";
  member_name?: string;
  member_phone?: string;
  member_status?: MemberStatus;
}

export type ExpenseCategory =
  | "loyer"
  | "electricite"
  | "eau_internet"
  | "salaires"
  | "materiel"
  | "maintenance"
  | "autre";

export interface Expense {
  id: string;
  amount_fcfa: number;
  category: ExpenseCategory;
  description?: string | null;
  paid_at: string; // YYYY-MM-DD
  created_by?: string | null;
  created_at: string; // ISO
  deleted_at?: string | null;
  deleted_by?: string | null;
}

export interface MonthFinancialSummary {
  monthKey: string;   // YYYY-MM
  monthLabel: string; // "Jan 26"
  revenue: number;
  expenses: number;
  net: number;
}

export interface GymStats {
  activeMembers: number;
  expiringSoonMembers: number;
  expiredMembers: number;
  totalMembers: number;
  todayAttendances: number;
  weekAttendances: number;
  monthRevenueFcfa: number;
  monthExpensesFcfa: number;
  monthNetFcfa: number;
  history6Months: MonthFinancialSummary[];
}

interface LocalGymData {
  members: Member[];
  payments: Payment[];
  attendances: Attendance[];
}

const gymFile = createJsonFileStore<LocalGymData>({
  relativePath: "data/gym-data.json",
  empty: { members: [], payments: [], attendances: [] },
  seed: getInitialLocalData,
});

// Calcul automatique du statut selon la date de fin
export function computeMemberStatus(endDateStr: string): MemberStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [y, m, d] = endDateStr.split("-").map(Number);
  const endDate = new Date(y, (m || 1) - 1, d || 1);
  endDate.setHours(0, 0, 0, 0);

  const diffTime = endDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "expire";
  if (diffDays <= 7) return "expire_bientot";
  return "actif";
}

/**
 * Génère un jeton QR opaque cryptographique (préfixé sfc_ + 32 caractères hexadécimaux).
 * Conforme à 'sfc_' || replace(gen_random_uuid()::text, '-', '')
 */
export function generateSecureQrToken(): string {
  return "sfc_" + randomUUID().replace(/-/g, "");
}

/**
 * Formate le numéro de membre court au format SF-0001 (stable, jamais recalculé).
 */
export function formatMemberNumber(num?: number | null, fallbackId?: string): string {
  if (typeof num === "number" && num > 0) {
    return `SF-${String(num).padStart(4, "0")}`;
  }
  if (fallbackId && fallbackId.startsWith("mem_demo_")) {
    const digit = fallbackId.replace("mem_demo_", "");
    return `SF-${digit.padStart(4, "0")}`;
  }
  return "SF-0000";
}

/**
 * Retourne la date au format YYYY-MM-DD dans le fuseau horaire de la salle (Africa/Dakar).
 */
export function getDakarDate(d: Date | string = new Date()): string {
  const dateObj = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Dakar",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(dateObj);
}

/**
 * Retourne l'heure au format HH:MM dans le fuseau horaire de la salle (Africa/Dakar).
 */
export function getDakarTime(d: Date | string = new Date()): string {
  const dateObj = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("fr-SN", {
    timeZone: "Africa/Dakar",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(dateObj);
}

export interface AttendanceErrorMeta {
  isExpired?: boolean;
  isDuplicate?: boolean;
  memberId?: string;
  memberName?: string;
  checkInTime?: string;
}

export class AttendanceError extends Error {
  isExpired?: boolean;
  isDuplicate?: boolean;
  memberId?: string;
  memberName?: string;
  checkInTime?: string;

  constructor(message: string, meta?: AttendanceErrorMeta) {
    super(message);
    this.name = "AttendanceError";
    if (meta) {
      this.isExpired = meta.isExpired;
      this.isDuplicate = meta.isDuplicate;
      this.memberId = meta.memberId;
      this.memberName = meta.memberName;
      this.checkInTime = meta.checkInTime;
    }
  }
}

function getInitialLocalData(): LocalGymData {
  const today = new Date();
  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  const in20Days = new Date(today);
  in20Days.setDate(today.getDate() + 20);

  const in5Days = new Date(today);
  in5Days.setDate(today.getDate() + 5);

  const ago10Days = new Date(today);
  ago10Days.setDate(today.getDate() - 10);

  const ago40Days = new Date(today);
  ago40Days.setDate(today.getDate() - 40);

  const in330Days = new Date(today);
  in330Days.setDate(today.getDate() + 330);

  const members: Member[] = [
    {
      id: "mem_demo_1",
      full_name: "Amadou Ba",
      phone: "+221 76 345 67 89",
      plan_id: "mensuel",
      start_date: formatDate(ago10Days),
      end_date: formatDate(in20Days),
      status: "actif",
      notes: "Inscrit suite à sa visite au club.",
      qr_token: "qr_amadou_ba",
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "mem_demo_2",
      full_name: "Awa Diallo",
      phone: "+221 77 456 78 90",
      plan_id: "trimestriel",
      start_date: formatDate(new Date(Date.now() - 85 * 86400000)),
      end_date: formatDate(in5Days),
      status: "expire_bientot",
      notes: "Cardio & Musculation après-midi",
      qr_token: "qr_awa_diallo",
      created_at: new Date(Date.now() - 85 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "mem_demo_3",
      full_name: "Ousmane Kane",
      phone: "+221 78 567 89 01",
      plan_id: "mensuel",
      start_date: formatDate(ago40Days),
      end_date: formatDate(ago10Days),
      status: "expire",
      notes: "Relance Wave à effectuer",
      qr_token: "qr_ousmane_kane",
      created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "mem_demo_4",
      full_name: "Marieme Sy",
      phone: "+221 77 678 90 12",
      plan_id: "annuel",
      start_date: formatDate(ago10Days),
      end_date: formatDate(in330Days),
      status: "actif",
      notes: "Membre très assidue le matin",
      qr_token: "qr_marieme_sy",
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const payments: Payment[] = [
    {
      id: "pay_demo_1",
      member_id: "mem_demo_1",
      amount_fcfa: 15000,
      method: "Wave",
      period_start: formatDate(ago10Days),
      period_end: formatDate(in20Days),
      note: "Paiement mensuel",
      recorded_by: "Samba Diop",
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      member_name: "Amadou Ba",
      member_phone: "+221 76 345 67 89",
    },
    {
      id: "pay_demo_2",
      member_id: "mem_demo_2",
      amount_fcfa: 40000,
      method: "Orange Money",
      period_start: formatDate(new Date(Date.now() - 85 * 86400000)),
      period_end: formatDate(in5Days),
      note: "Forfait 3 mois",
      recorded_by: "Samba Diop",
      created_at: new Date(Date.now() - 85 * 86400000).toISOString(),
      member_name: "Awa Diallo",
      member_phone: "+221 77 456 78 90",
    },
    {
      id: "pay_demo_3",
      member_id: "mem_demo_4",
      amount_fcfa: 150000,
      method: "Espèces",
      period_start: formatDate(ago10Days),
      period_end: formatDate(in330Days),
      note: "Abonnement annuel complet",
      recorded_by: "Samba Diop",
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      member_name: "Marieme Sy",
      member_phone: "+221 77 678 90 12",
    },
  ];

  const attendances: Attendance[] = [
    {
      id: "att_demo_1",
      member_id: "mem_demo_1",
      checked_in_at: new Date(Date.now() - 2 * 3600000).toISOString(),
      recorded_by: "Samba Diop",
      method: "manuel",
      member_name: "Amadou Ba",
      member_phone: "+221 76 345 67 89",
      member_status: "actif",
    },
    {
      id: "att_demo_2",
      member_id: "mem_demo_4",
      checked_in_at: new Date(Date.now() - 4 * 3600000).toISOString(),
      recorded_by: "Samba Diop",
      method: "manuel",
      member_name: "Marieme Sy",
      member_phone: "+221 77 678 90 12",
      member_status: "actif",
    },
  ];

  return { members, payments, attendances };
}

function readLocalGymData(): LocalGymData {
  return gymFile.read();
}

function writeLocalGymData(data: LocalGymData): void {
  gymFile.write(data);
}

// ─────────────────────────────────────────────────────────────
// MEMBRES
// ─────────────────────────────────────────────────────────────

export async function getMembers(): Promise<Member[]> {
  const localData = readLocalGymData();
  const withStatus = (m: Member) => ({ ...m, status: computeMemberStatus(m.end_date) });

  const remote = await runSupabase("getMembers", async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .order("created_at", { ascending: false });
    if (error || !Array.isArray(data)) return null;
    return data as Member[];
  });

  if (remote) {
    return mergeById(remote.map(withStatus), localData.members.map(withStatus));
  }

  return localData.members.map(withStatus);
}

export async function saveMember(
  data: Omit<Member, "id" | "status" | "created_at" | "updated_at"> & { id?: string }
): Promise<Member> {
  const now = new Date().toISOString();
  const status = computeMemberStatus(data.end_date);
  const local = readLocalGymData();

  const existingIdx = data.id ? local.members.findIndex((m) => m.id === data.id) : -1;
  const existing = existingIdx !== -1 ? local.members[existingIdx] : null;

  // Numéro de membre stable (jamais recalculé)
  let memberNumber = existing?.member_number ?? data.member_number;
  if (!memberNumber) {
    const maxNum = local.members.reduce((acc, m) => Math.max(acc, m.member_number || 0), 0);
    memberNumber = maxNum + 1;
  }

  // Jeton QR opaque sécurisé (au moins 20 caractères, préfixé sfc_)
  let qrToken = existing?.qr_token || data.qr_token;
  if (!qrToken || qrToken.length < 20 || qrToken.startsWith("qr_")) {
    qrToken = generateSecureQrToken();
  }

  const member: Member = {
    id: data.id || `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    member_number: memberNumber,
    full_name: data.full_name,
    phone: data.phone,
    plan_id: data.plan_id,
    start_date: data.start_date,
    end_date: data.end_date,
    status,
    notes: data.notes || null,
    qr_token: qrToken,
    created_at: existing ? existing.created_at : now,
    updated_at: now,
  };

  if (existingIdx !== -1) {
    local.members[existingIdx] = member;
  } else {
    local.members.unshift(member);
  }
  writeLocalGymData(local);

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.from("members").upsert(member);
    } catch (err) {
      logger.warn({ err }, "Erreur upsert member Supabase");
    }
  }

  return member;
}

export async function regenerateMemberQrToken(memberId: string): Promise<Member> {
  const members = await getMembers();
  const member = members.find((m) => m.id === memberId);
  if (!member) {
    throw new Error("Membre introuvable.");
  }

  const newToken = generateSecureQrToken();
  const now = new Date().toISOString();
  const updated: Member = {
    ...member,
    qr_token: newToken,
    updated_at: now,
  };

  const local = readLocalGymData();
  const idx = local.members.findIndex((m) => m.id === memberId);
  if (idx !== -1) {
    local.members[idx] = updated;
    writeLocalGymData(local);
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase
        .from("members")
        .update({ qr_token: newToken, updated_at: now })
        .eq("id", memberId);
    } catch (err) {
      logger.warn({ err }, "Erreur regenerateMemberQrToken Supabase");
    }
  }

  return updated;
}

export async function getMemberByQrToken(qrToken: string): Promise<Member | null> {
  const clean = qrToken.trim();
  if (!clean) return null;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .eq("qr_token", clean)
        .maybeSingle();

      if (!error && data) {
        const m = data as Member;
        return {
          ...m,
          status: computeMemberStatus(m.end_date),
        };
      }
    } catch (err) {
      logger.warn({ err }, "Erreur getMemberByQrToken Supabase");
    }
  }

  const local = readLocalGymData();
  const found = local.members.find((m) => m.qr_token === clean);
  if (found) {
    return {
      ...found,
      status: computeMemberStatus(found.end_date),
    };
  }
  return null;
}

export async function deleteMember(id: string): Promise<boolean> {
  const local = readLocalGymData();
  local.members = local.members.filter((m) => m.id !== id);
  local.payments = local.payments.filter((p) => p.member_id !== id);
  local.attendances = local.attendances.filter((a) => a.member_id !== id);
  writeLocalGymData(local);

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.from("members").delete().eq("id", id);
    } catch (err) {
      logger.warn({ err }, "Erreur delete member Supabase");
    }
  }

  return true;
}

// ─────────────────────────────────────────────────────────────
// PAIEMENTS
// ─────────────────────────────────────────────────────────────

export async function getPayments(): Promise<Payment[]> {
  const local = readLocalGymData();

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("payments")
        .select("*, members(full_name, phone)")
        .order("created_at", { ascending: false });

      if (!error && data && Array.isArray(data)) {
        const supabasePayments: Payment[] = data.map((p) => ({
          id: p.id,
          member_id: p.member_id,
          amount_fcfa: p.amount_fcfa,
          method: p.method,
          period_start: p.period_start,
          period_end: p.period_end,
          note: p.note,
          recorded_by: p.recorded_by,
          created_at: p.created_at,
          member_name: p.members?.full_name || "Membre",
          member_phone: p.members?.phone || "",
        }));
        return mergeById(supabasePayments, local.payments).sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
    } catch (err) {
      logger.warn({ err }, "Erreur getPayments Supabase");
    }
  }

  return local.payments.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function recordPayment(
  data: Omit<Payment, "id" | "created_at"> & { autoExtend?: boolean }
): Promise<{ payment: Payment; updatedMember: Member | null }> {
  const now = new Date().toISOString();
  const payment: Payment = {
    id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    member_id: data.member_id,
    amount_fcfa: Number(data.amount_fcfa),
    method: data.method,
    period_start: data.period_start,
    period_end: data.period_end,
    note: data.note || null,
    recorded_by: data.recorded_by || "Admin",
    created_at: now,
    member_name: data.member_name,
    member_phone: data.member_phone,
  };

  // 1. Mise à jour de l'adhésion du membre (prolongation automatique)
  const members = await getMembers();
  let updatedMember: Member | null = null;
  const currentMember = members.find((m) => m.id === data.member_id);

  if (currentMember) {
    // Si la période payée va plus loin que l'end_date actuelle, on prolonge
    const newEndDate =
      data.period_end > currentMember.end_date ? data.period_end : currentMember.end_date;
    const newStatus = computeMemberStatus(newEndDate);

    updatedMember = {
      ...currentMember,
      end_date: newEndDate,
      status: newStatus,
      updated_at: now,
    };

    payment.member_name = currentMember.full_name;
    payment.member_phone = currentMember.phone;

    // Sauvegarde membre local
    const local = readLocalGymData();
    const idx = local.members.findIndex((m) => m.id === currentMember.id);
    if (idx !== -1) {
      local.members[idx] = updatedMember;
    }
    local.payments.unshift(payment);
    writeLocalGymData(local);

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createClient();
        await Promise.all([
          supabase.from("payments").insert([{
            id: payment.id,
            member_id: payment.member_id,
            amount_fcfa: payment.amount_fcfa,
            method: payment.method,
            period_start: payment.period_start,
            period_end: payment.period_end,
            note: payment.note,
            recorded_by: payment.recorded_by,
            created_at: payment.created_at,
          }]),
          supabase.from("members").update({
            end_date: newEndDate,
            status: newStatus,
            updated_at: now,
          }).eq("id", currentMember.id),
        ]);
      } catch (err) {
        logger.warn({ err }, "Erreur recordPayment Supabase");
      }
    }
  }

  return { payment, updatedMember };
}

// ─────────────────────────────────────────────────────────────
// PRÉSENCES (ATTENDANCES)
// ─────────────────────────────────────────────────────────────

export async function getAttendances(): Promise<Attendance[]> {
  const local = readLocalGymData();

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("attendances")
        .select("*, members(full_name, phone, end_date)")
        .order("checked_in_at", { ascending: false })
        .limit(100);

      if (!error && data && Array.isArray(data)) {
        const supabaseAttendances = data.map((a) => ({
          id: a.id,
          member_id: a.member_id,
          checked_in_at: a.checked_in_at,
          recorded_by: a.recorded_by,
          method: a.method,
          member_name: a.members?.full_name || "Membre",
          member_phone: a.members?.phone || "",
          member_status: a.members?.end_date ? computeMemberStatus(a.members.end_date) : "actif",
        }));
        const supabaseIds = new Set(supabaseAttendances.map((a) => a.id));
        const nonDuplicateLocal = local.attendances.filter((a) => !supabaseIds.has(a.id));
        return [...supabaseAttendances, ...nonDuplicateLocal].sort(
          (a, b) => new Date(b.checked_in_at).getTime() - new Date(a.checked_in_at).getTime()
        );
      }
    } catch (err) {
      logger.warn({ err }, "Erreur getAttendances Supabase");
    }
  }

  return local.attendances.sort(
    (a, b) => new Date(b.checked_in_at).getTime() - new Date(a.checked_in_at).getTime()
  );
}

export async function recordAttendance(
  memberId: string,
  recordedBy = "Admin",
  method: "manuel" | "qr_code" = "manuel"
): Promise<{ attendance: Attendance; isExpired: boolean; memberName: string; member: Member }> {
  const members = await getMembers();
  const member = members.find((m) => m.id === memberId);
  if (!member) {
    throw new AttendanceError("Membre introuvable.");
  }

  // 1. Refus strict si l'abonnement est expiré
  if (member.status === "expire") {
    const [y, m, d] = (member.end_date || "").split("-");
    const formattedEnd = y && m && d ? `${d}/${m}/${y}` : member.end_date;
    throw new AttendanceError(
      `Accès refusé : l'abonnement de ${member.full_name} a expiré le ${formattedEnd}. Renouvellement requis avant tout accès.`,
      {
        isExpired: true,
        memberId: member.id,
        memberName: member.full_name,
      }
    );
  }

  const now = new Date();
  const nowIso = now.toISOString();
  const todayDakar = getDakarDate(now);

  // 2. Protection stricte contre le doublon du jour calendaire (Africa/Dakar)
  const existingAttendances = await getAttendances();
  const existingToday = existingAttendances.find(
    (a) => a.member_id === memberId && getDakarDate(a.checked_in_at) === todayDakar
  );

  if (existingToday) {
    const timeStr = getDakarTime(existingToday.checked_in_at);
    throw new AttendanceError(
      `Pointage refusé : ${member.full_name} a déjà été pointé aujourd'hui à ${timeStr}.`,
      {
        isDuplicate: true,
        memberId: member.id,
        memberName: member.full_name,
        checkInTime: timeStr,
      }
    );
  }

  const attendance: Attendance = {
    id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    member_id: memberId,
    checked_in_at: nowIso,
    recorded_by: recordedBy,
    method,
    member_name: member.full_name,
    member_phone: member.phone,
    member_status: member.status,
  };

  const local = readLocalGymData();
  local.attendances.unshift(attendance);
  writeLocalGymData(local);

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from("attendances").insert([{
        id: attendance.id,
        member_id: attendance.member_id,
        checked_in_at: attendance.checked_in_at,
        recorded_by: attendance.recorded_by,
        method: attendance.method,
      }]);

      if (error && (error.code === "23505" || error.message?.includes("uq_attendances_member_dakar_day"))) {
        throw new AttendanceError(
          `Pointage refusé : ${member.full_name} a déjà été pointé aujourd'hui.`,
          {
            isDuplicate: true,
            memberId: member.id,
            memberName: member.full_name,
          }
        );
      }
    } catch (err) {
      if (err instanceof AttendanceError) throw err;
      logger.warn({ err }, "Erreur recordAttendance Supabase");
    }
  }

  return { attendance, isExpired: false, memberName: member.full_name, member };
}

// ─────────────────────────────────────────────────────────────
// DÉPENSES (EXPENSES) - SUPABASE UNIQUEMENT (PAS DE RECOURS JSON)
// ─────────────────────────────────────────────────────────────

export async function getExpenses(): Promise<Expense[]> {
  if (!isSupabaseConfigured()) {
    logger.warn("Tentative de chargement des dépenses alors que Supabase n'est pas configuré.");
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .is("deleted_at", null)
    .order("paid_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    logger.error({ error }, "Erreur getExpenses Supabase");
    throw new Error(
      `Impossible de récupérer les dépenses depuis la base de données : ${error.message}`
    );
  }

  return (data || []) as Expense[];
}

export async function recordExpense(data: {
  amount_fcfa: number;
  category: ExpenseCategory;
  description?: string | null;
  paid_at: string;
  created_by?: string | null;
}): Promise<Expense> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Base de données Supabase non configurée. Impossible d'enregistrer la dépense."
    );
  }

  const id = `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const supabase = await createClient();
  const { data: inserted, error } = await supabase
    .from("expenses")
    .insert([
      {
        id,
        amount_fcfa: data.amount_fcfa,
        category: data.category,
        description: data.description?.trim() || null,
        paid_at: data.paid_at,
        created_by: data.created_by || null,
        created_at: now,
      },
    ])
    .select()
    .single();

  if (error || !inserted) {
    logger.error({ error }, "Erreur recordExpense Supabase");
    throw new Error(
      `Échec de l'enregistrement de la dépense dans Supabase : ${error?.message || "Erreur inconnue"}`
    );
  }

  return inserted as Expense;
}

export async function softDeleteExpense(id: string, deletedBy: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Base de données Supabase non configurée. Impossible d'archiver la dépense."
    );
  }

  const now = new Date().toISOString();
  const supabase = await createClient();
  const { error } = await supabase
    .from("expenses")
    .update({
      deleted_at: now,
      deleted_by: deletedBy,
    })
    .eq("id", id);

  if (error) {
    logger.error({ error }, "Erreur softDeleteExpense Supabase");
    throw new Error(`Échec de l'archivage de la dépense : ${error.message}`);
  }

  return true;
}

// ─────────────────────────────────────────────────────────────
// STATISTIQUES GYM (TABLEAU DE BORD)
// ─────────────────────────────────────────────────────────────

export async function getGymStats(): Promise<GymStats> {
  let expenses: Expense[] = [];
  try {
    expenses = await getExpenses();
  } catch (err) {
    logger.warn({ err }, "Impossible de récupérer les dépenses pour les statistiques");
  }

  const [members, payments, attendances] = await Promise.all([
    getMembers(),
    getPayments(),
    getAttendances(),
  ]);

  const activeMembers = members.filter((m) => m.status === "actif").length;
  const expiringSoonMembers = members.filter((m) => m.status === "expire_bientot").length;
  const expiredMembers = members.filter((m) => m.status === "expire").length;

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const todayAttendances = attendances.filter((a) =>
    a.checked_in_at.startsWith(todayStr)
  ).length;

  const weekAttendances = attendances.filter(
    (a) => new Date(a.checked_in_at) >= sevenDaysAgo
  ).length;

  // Calcul basé sur created_at pour être cohérent avec "Encaissé ce mois"
  const monthRevenueFcfa = payments
    .filter((p) => new Date(p.created_at) >= startOfMonth)
    .reduce((sum, p) => sum + (Number(p.amount_fcfa) || 0), 0);

  const monthExpensesFcfa = expenses
    .filter((e) => new Date(e.created_at) >= startOfMonth)
    .reduce((sum, e) => sum + (Number(e.amount_fcfa) || 0), 0);

  const monthNetFcfa = monthRevenueFcfa - monthExpensesFcfa;

  // Historique des 6 derniers mois (Revenus vs Dépenses)
  const monthNames = [
    "Jan",
    "Fév",
    "Mar",
    "Avr",
    "Mai",
    "Juin",
    "Juil",
    "Août",
    "Sep",
    "Oct",
    "Nov",
    "Déc",
  ];
  const history6Months: MonthFinancialSummary[] = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const mYear = d.getFullYear();
    const mMonth = d.getMonth();
    const nextM = new Date(mYear, mMonth + 1, 1);
    const monthKey = `${mYear}-${String(mMonth + 1).padStart(2, "0")}`;
    const monthLabel = `${monthNames[mMonth]} ${String(mYear).slice(2)}`;

    const rev = payments
      .filter((p) => {
        const pDate = new Date(p.created_at);
        return pDate >= d && pDate < nextM;
      })
      .reduce((sum, p) => sum + (Number(p.amount_fcfa) || 0), 0);

    const exp = expenses
      .filter((e) => {
        const eDate = new Date(e.created_at);
        return eDate >= d && eDate < nextM;
      })
      .reduce((sum, e) => sum + (Number(e.amount_fcfa) || 0), 0);

    return {
      monthKey,
      monthLabel,
      revenue: rev,
      expenses: exp,
      net: rev - exp,
    };
  });

  return {
    activeMembers,
    expiringSoonMembers,
    expiredMembers,
    totalMembers: members.length,
    todayAttendances,
    weekAttendances,
    monthRevenueFcfa,
    monthExpensesFcfa,
    monthNetFcfa,
    history6Months,
  };
}

