"use server";

import { getLeads, updateLeadStatus, deleteLead, type Lead } from "@/lib/leads-store";
import { getSiteContent, updateSiteContent, resetSiteContent, type SiteContentType } from "@/lib/content-store";
import { AdminAuthError, requireAdmin, type AdminRole } from "@/lib/auth/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient, createAdminServiceClient } from "@/lib/supabase/server";
import { createJsonFileStore } from "@/lib/sync-store";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";

export interface AdminDataResult {
  leads: Lead[];
  content: SiteContentType;
  supabaseConfigured: boolean;
}

export interface StaffAccount {
  email: string;
  role: AdminRole;
  created_at?: string;
}

export type ActionResult<T = object> =
  | ({ success: true } & T)
  | { success: false; error: string };

const LEAD_STATUSES: Lead["status"][] = ["nouveau", "contacté", "inscrit", "archivé"];

const localStaffStore = createJsonFileStore<StaffAccount[]>({
  relativePath: "data/staff.json",
  empty: [
    { email: "sambafitnessadmin@gmail.com", role: "super_admin", created_at: new Date().toISOString() },
    { email: "gerant@sambafitness.sn", role: "receptionist", created_at: new Date().toISOString() },
  ],
});

/** Exécute une action après vérification du rôle, et convertit les erreurs en résultat lisible. */
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
    logger.error({ err }, "Erreur action admin");
    return { success: false, error: "Une erreur est survenue. Réessayez." };
  }
}

export async function fetchAdminData(): Promise<ActionResult<AdminDataResult>> {
  return guarded("receptionist", async () => {
    const [leads, content] = await Promise.all([getLeads(), getSiteContent()]);
    return { leads, content, supabaseConfigured: isSupabaseConfigured() };
  });
}

export async function updateLeadStatusAction(
  id: string,
  status: Lead["status"]
): Promise<ActionResult> {
  return guarded("receptionist", async () => {
    if (typeof id !== "string" || !LEAD_STATUSES.includes(status)) {
      throw new AdminAuthError("Statut invalide.");
    }
    await updateLeadStatus(id, status);
    revalidatePath("/admin");
    return {};
  });
}

export async function archiveLeadsBatchAction(
  ids: string[]
): Promise<ActionResult<{ count: number }>> {
  return guarded("receptionist", async () => {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new AdminAuthError("Aucune demande sélectionnée.");
    }
    for (const id of ids) {
      await updateLeadStatus(id, "archivé");
    }
    revalidatePath("/admin");
    return { count: ids.length };
  });
}

export async function deleteLeadAction(id: string): Promise<ActionResult> {
  return guarded("super_admin", async () => {
    await deleteLead(String(id));
    revalidatePath("/admin");
    return {};
  });
}

export async function saveSiteContentAction(
  updates: Partial<SiteContentType>
): Promise<ActionResult<{ content: SiteContentType }>> {
  return guarded("super_admin", async () => {
    const content = await updateSiteContent(updates);
    revalidatePath("/");
    revalidatePath("/admin");
    return { content };
  });
}

export async function resetSiteContentAction(): Promise<
  ActionResult<{ content: SiteContentType }>
> {
  return guarded("super_admin", async () => {
    const content = await resetSiteContent();
    revalidatePath("/");
    revalidatePath("/admin");
    return { content };
  });
}

/**
 * Création d'un compte gérant / réceptionniste par le super-administrateur
 */
export async function createStaffAccountAction(data: {
  email: string;
  password: string;
  role?: AdminRole;
}): Promise<ActionResult<{ email: string; role: AdminRole }>> {
  return guarded("super_admin", async () => {
    const normalizedEmail = data.email?.trim().toLowerCase();
    const role: AdminRole = data.role === "super_admin" ? "super_admin" : "receptionist";

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      throw new AdminAuthError("Veuillez saisir une adresse email valide.");
    }

    if (!data.password || data.password.length < 8) {
      throw new AdminAuthError("Le mot de passe doit comporter au moins 8 caractères.");
    }

    const adminClient = createAdminServiceClient();

    if (adminClient) {
      // 1. Création de l'utilisateur dans Supabase Auth
      const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
        email: normalizedEmail,
        password: data.password,
        email_confirm: true,
        user_metadata: { full_name: `Gérant ${normalizedEmail.split("@")[0]}` },
      });

      if (authError && !authError.message.includes("already registered")) {
        logger.error({ authError }, "Erreur création utilisateur Supabase Auth");
        throw new AdminAuthError(`Erreur Supabase Auth: ${authError.message}`);
      }

      // Si l'utilisateur existait déjà, on met à jour son mot de passe
      if (authError?.message.includes("already registered")) {
        const { data: usersData } = await adminClient.auth.admin.listUsers();
        const existing = usersData?.users?.find(
          (u) => u.email?.toLowerCase() === normalizedEmail
        );
        if (existing) {
          await adminClient.auth.admin.updateUserById(existing.id, {
            password: data.password,
          });
        }
      }

      // 2. Inscription dans admin_whitelist
      const { error: whitelistError } = await adminClient
        .from("admin_whitelist")
        .upsert({ email: normalizedEmail, role });

      if (whitelistError) {
        logger.error({ whitelistError }, "Erreur whitelist Supabase");
        throw new AdminAuthError("Impossible d'inscrire l'utilisateur dans la liste des accès.");
      }
    } else {
      // Fallback local dev
      const list = localStaffStore.read();
      const existing = list.findIndex((s) => s.email === normalizedEmail);
      if (existing !== -1) {
        list[existing].role = role;
      } else {
        list.push({ email: normalizedEmail, role, created_at: new Date().toISOString() });
      }
      localStaffStore.write(list);
    }

    logger.info({ email: normalizedEmail, role }, "Compte staff/gérant créé avec succès");
    revalidatePath("/admin");
    return { email: normalizedEmail, role };
  });
}

/**
 * Récupère la liste des comptes d'administration / gérants
 */
export async function listStaffAccountsAction(): Promise<ActionResult<{ staff: StaffAccount[] }>> {
  return guarded("super_admin", async () => {
    if (isSupabaseConfigured()) {
      try {
        // Préférer le client service_role (côté serveur) pour contourner les restrictions RLS
        const adminClient = createAdminServiceClient();
        const client = adminClient || (await createClient());

        // Timeout de sécurité de 5s pour éviter tout blocage réseau / pause Supabase
        const fetchPromise = client
          .from("admin_whitelist")
          .select("email, role, created_at")
          .order("created_at", { ascending: false });

        const timeoutPromise = new Promise<{ data: null; error: Error }>((_, reject) =>
          setTimeout(() => reject(new Error("Timeout Supabase après 5000ms")), 5000)
        );

        const { data, error } = (await Promise.race([fetchPromise, timeoutPromise])) as {
          data: StaffAccount[] | null;
          error: unknown;
        };

        if (!error && data && data.length > 0) {
          return { staff: data };
        }
      } catch (err) {
        logger.warn({ err }, "Erreur ou timeout listStaffAccountsAction Supabase, repli local");
      }
    }

    const localList = localStaffStore.read();
    return { staff: localList };
  });
}

/**
 * Supprime ou révoque l'accès d'un compte staff / gérant
 */
export async function deleteStaffAccountAction(email: string): Promise<ActionResult> {
  return guarded("super_admin", async () => {
    const adminCtx = await requireAdmin("super_admin");
    const targetEmail = email.trim().toLowerCase();

    if (adminCtx.email.toLowerCase() === targetEmail) {
      throw new AdminAuthError("Vous ne pouvez pas supprimer votre propre compte administrateur.");
    }

    const adminClient = createAdminServiceClient();
    if (adminClient) {
      // Supprimer de la whitelist
      await adminClient.from("admin_whitelist").delete().eq("email", targetEmail);

      // Tenter de supprimer de Supabase Auth
      try {
        const { data } = await adminClient.auth.admin.listUsers();
        const match = data?.users.find((u) => u.email?.toLowerCase() === targetEmail);
        if (match) {
          await adminClient.auth.admin.deleteUser(match.id);
        }
      } catch {
        // Ignorer
      }
    } else {
      const list = localStaffStore.read().filter((s) => s.email !== targetEmail);
      localStaffStore.write(list);
    }

    logger.info({ targetEmail }, "Accès gérant révoqué avec succès");
    revalidatePath("/admin");
    return {};
  });
}
