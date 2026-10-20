import "server-only";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  DEMO_COOKIE_NAME,
  isDemoModeAllowed,
  isSupabaseConfigured,
} from "@/lib/supabase/config";
import { logger } from "@/lib/logger";

export type AdminRole = "super_admin" | "receptionist";

export interface AdminContext {
  email: string;
  role: AdminRole;
  isDemo: boolean;
}

export type AuthState =
  | { status: "anonymous" }
  | { status: "forbidden"; email: string }
  | { status: "admin"; admin: AdminContext };

/**
 * Data Access Layer de l'admin : lit la session Supabase côté serveur
 * et vérifie que l'email figure dans `admin_whitelist`.
 * Le rôle est résolu par la fonction SQL `current_admin_role()`,
 * la même que celle utilisée par les règles RLS.
 */
export async function getAuthState(): Promise<AuthState> {
  if (isDemoModeAllowed()) {
    const cookieStore = await cookies();
    if (cookieStore.get(DEMO_COOKIE_NAME)?.value === "1") {
      return {
        status: "admin",
        admin: { email: "demo@local", role: "super_admin", isDemo: true },
      };
    }
  }

  if (!isSupabaseConfigured()) {
    return { status: "anonymous" };
  }

  try {
    const supabase = await createClient();
    // getUser() valide le jeton auprès de Supabase (contrairement à getSession()).
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return { status: "anonymous" };
    }

    // Lecture du rôle dans admin_whitelist (protégée par RLS pour son propre email)
    let role: string | null = null;
    const { data: whitelistEntry } = await supabase
      .from("admin_whitelist")
      .select("role")
      .eq("email", user.email.toLowerCase())
      .maybeSingle();

    if (whitelistEntry?.role) {
      role = whitelistEntry.role;
    } else {
      const { data: rpcRole } = await supabase.rpc("current_admin_role");
      if (rpcRole) role = rpcRole;
    }

    if (role !== "super_admin" && role !== "receptionist") {
      return { status: "forbidden", email: user.email };
    }

    return {
      status: "admin",
      admin: { email: user.email, role, isDemo: false },
    };
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      ("digest" in err || (err as Error).name === "DynamicServerError")
    ) {
      throw err;
    }
    logger.error({ err }, "Vérification de l'administrateur impossible");
    return { status: "anonymous" };
  }
}

export async function getAdminContext(): Promise<AdminContext | null> {
  const state = await getAuthState();
  return state.status === "admin" ? state.admin : null;
}

export class AdminAuthError extends Error {}

/**
 * À appeler en tête de chaque server action de l'admin.
 * `receptionist` : pointage, paiements, prospects (sans suppression).
 * `super_admin` : tout, y compris le contenu du site et les suppressions.
 */
export async function requireAdmin(
  minRole: AdminRole = "receptionist"
): Promise<AdminContext> {
  const admin = await getAdminContext();
  if (!admin) {
    throw new AdminAuthError("Accès refusé : vous n'êtes pas connecté en tant qu'administrateur.");
  }
  if (minRole === "super_admin" && admin.role !== "super_admin") {
    throw new AdminAuthError("Accès refusé : cette action est réservée au super-administrateur.");
  }
  return admin;
}
