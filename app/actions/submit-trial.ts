"use server";

import { headers } from "next/headers";
import { logger } from "@/lib/logger";
import { checkRateLimit, getClientIp, RATE_LIMITS, rateLimitMessage } from "@/lib/rate-limit";

export interface TrialFormState {
  success: boolean;
  message?: string;
  errors?: {
    name?: string;
    phone?: string;
    salle?: string;
    message?: string;
  };
}

export async function submitTrialAction(
  _prevState: TrialFormState,
  formData: FormData
): Promise<TrialFormState> {
  // Rate limiting (max 3 soumissions / heure par IP)
  try {
    const headersList = await headers();
    const ip = getClientIp(headersList);
    const rateLimitCheck = checkRateLimit(`contact:${ip}`, RATE_LIMITS.contact);
    if (!rateLimitCheck.allowed) {
      return {
        success: false,
        message: rateLimitMessage("contact", rateLimitCheck),
      };
    }
  } catch {
    // Si headers() n'est pas disponible (ex: environnement de test isolé), on continue
  }

  // Protection Honeypot : si ce champ caché est rempli, c'est un bot automatisé
  const honeypot = formData.get("website_hp") as string | null;
  if (honeypot && honeypot.trim().length > 0) {
    logger.warn({ honeypot }, "Soumission interceptée par le honeypot anti-spam");
    return {
      success: true,
      message:
        "Merci ! Votre demande d'inscription a bien été enregistrée. Nous vous contacterons rapidement pour finaliser votre inscription.",
    };
  }

  const name = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const salle = (formData.get("salle") as string)?.trim();
  const message = (formData.get("message") as string)?.trim() || "";

  // Validation avec Zod
  const { trialFormSchema } = await import("@/lib/validations/gym");
  const parseResult = trialFormSchema.safeParse({ name, phone, salle, message });

  if (!parseResult.success) {
    const formattedErrors: TrialFormState["errors"] = {};
    for (const issue of parseResult.error.issues) {
      const field = issue.path[0] as keyof NonNullable<TrialFormState["errors"]>;
      if (field && !formattedErrors[field]) {
        formattedErrors[field] = issue.message;
      }
    }
    return {
      success: false,
      message: "Veuillez corriger les informations saisies.",
      errors: formattedErrors,
    };
  }

  const validData = parseResult.data;

  // Enregistrement du prospect (Local + Supabase si configuré)
  try {
    const { saveLead } = await import("@/lib/leads-store");
    await saveLead({
      name: validData.name,
      phone: validData.phone,
      club: validData.salle,
      message: validData.message || null,
    });

    return {
      success: true,
      message:
        "Merci ! Votre demande d'inscription a bien été enregistrée. Nous vous contacterons rapidement pour finaliser votre inscription.",
    };
  } catch (err) {
    logger.error({ err }, "Erreur serveur lors de la soumission de l'essai");
    // Même en cas d'erreur réseau Supabase, on rassure l'utilisateur en mode vitrine
    return {
      success: true,
      message:
        "Votre demande d'inscription a bien été prise en compte ! Nous vous recontacterons rapidement.",
    };
  }
}
