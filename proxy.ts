import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { DEMO_COOKIE_NAME, getSupabaseEnv, isDemoModeAllowed } from "@/lib/supabase/config";
import { checkRateLimit, getClientIp, RATE_LIMITS, rateLimitMessage } from "@/lib/rate-limit";

/**
 * Vérification optimiste côté serveur pour /admin :
 * - rafraîchit la session Supabase (cookies) ;
 * - redirige vers /admin/login si aucun utilisateur n'est connecté.
 * L'autorisation réelle (whitelist + rôle) est faite dans la page et dans chaque server action.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/admin/login" || pathname.startsWith("/admin/login/");

  if (isLoginPage && request.method === "POST") {
    const ip = getClientIp(request.headers);
    const check = checkRateLimit(`login:${ip}`, RATE_LIMITS.login);
    if (!check.allowed) {
      return NextResponse.json(
        { error: rateLimitMessage("login", check) },
        {
          status: 429,
          headers: {
            "Retry-After": String(check.retryAfterSec),
            "X-Robots-Tag": "noindex, nofollow",
          },
        }
      );
    }
  }

  const isDemo =
    isDemoModeAllowed() && request.cookies.get(DEMO_COOKIE_NAME)?.value === "1";

  let hasUser = false;
  const env = getSupabaseEnv();
  if (env) {
    const supabase = createServerClient(env.url, env.key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      hasUser = Boolean(user);
    } catch {
      hasUser = false;
    }
  }

  if (!isLoginPage && !hasUser && !isDemo) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.search = "";
    return NextResponse.redirect(loginUrl);
  }

  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
