/**
 * Indique si de vraies clés Supabase sont renseignées
 * (et non les valeurs d'exemple de `.env.example`).
 */
export function getSupabaseEnv(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url.includes("votre-projet") || key.includes("votre-cle")) {
    return null;
  }
  return { url, key };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseEnv() !== null;
}

/** Le mode démo de l'admin n'existe qu'en développement local. */
export function isDemoModeAllowed(): boolean {
  return process.env.NODE_ENV === "development";
}

/** Cookie httpOnly posé par le serveur pour activer le mode démo (dev uniquement). */
export const DEMO_COOKIE_NAME = "sf_admin_demo";
