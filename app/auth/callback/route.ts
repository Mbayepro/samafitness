import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

/** N'accepte qu'un chemin interne ("/admin"), jamais "//site" ou "@site". */
function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return "/admin";
  }
  return next;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (errorParam) {
    logger.error({ errorParam, errorDescription }, "Erreur retour OAuth Google");
    return NextResponse.redirect(
      `${origin}/admin/login?error=${encodeURIComponent(
        errorDescription || errorParam
      )}`
    );
  }

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      logger.error({ err: error.message }, "Erreur exchangeCodeForSession");
      return NextResponse.redirect(
        `${origin}/admin/login?error=${encodeURIComponent(error.message)}`
      );
    } catch (err) {
      logger.error({ err }, "Exception callback auth");
      return NextResponse.redirect(
        `${origin}/admin/login?error=auth_exception`
      );
    }
  }

  // Si aucun code n'est présent
  return NextResponse.redirect(`${origin}/admin/login`);
}
