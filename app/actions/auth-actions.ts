"use server";

import { cookies, headers } from "next/headers";
import { DEMO_COOKIE_NAME, isDemoModeAllowed } from "@/lib/supabase/config";
import { checkRateLimit, getClientIp, RATE_LIMITS, rateLimitMessage } from "@/lib/rate-limit";

/** Active le mode démo de l'admin. Refusé hors développement local. */
export async function enterDemoModeAction(): Promise<{ success: boolean; error?: string }> {
  if (!isDemoModeAllowed()) {
    return { success: false, error: "Le mode démo n'est disponible qu'en développement local." };
  }
  const cookieStore = await cookies();
  cookieStore.set(DEMO_COOKIE_NAME, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return { success: true };
}

export async function exitDemoModeAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_COOKIE_NAME);
}

/** Vérifie et applique le rate limit sur les tentatives de connexion admin (5 / 15 min). */
export async function verifyLoginRateLimitAction(): Promise<{ allowed: boolean; error?: string }> {
  try {
    const headersList = await headers();
    const ip = getClientIp(headersList);
    const result = checkRateLimit(`login:${ip}`, RATE_LIMITS.login);
    if (!result.allowed) {
      return { allowed: false, error: rateLimitMessage("login", result) };
    }
    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}
