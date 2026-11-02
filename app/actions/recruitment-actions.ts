"use server";

import { headers } from "next/headers";
import { logger } from "@/lib/logger";
import { checkRateLimit, getClientIp, RATE_LIMITS, rateLimitMessage } from "@/lib/rate-limit";
import {
  saveCandidate,
  getCandidates,
  updateCandidateStatus,
  updateCandidateNotes,
  deleteCandidate,
  type Candidate,
  type CandidateStatus,
} from "@/lib/candidates-store";
import { candidateSchema } from "@/lib/validations/gym";
import { getAdminContext } from "@/lib/auth/admin";

export interface ApplicationFormState {
  success: boolean;
  message?: string;
  candidateId?: string;
  errors?: Partial<Record<string, string>>;
}

// Date limite stricte : 20 Novembre 2026 à 23h59:59 (Heure de Dakar, UTC)
const RECRUITMENT_DEADLINE = new Date("2026-11-20T23:59:59Z");

export async function submitApplicationAction(
  _prevState: ApplicationFormState,
  formData: FormData
): Promise<ApplicationFormState> {
  // 1. Vérification de la date limite
  const now = new Date();
  if (now.getTime() > RECRUITMENT_DEADLINE.getTime()) {
    return {
      success: false,
      message:
        "La période de candidature pour cet appel s'est achevée le 20 novembre 2026. Les candidatures reçues après la date limite ne peuvent plus être prises en compte.",
    };
  }

  // 2. Rate limiting anti-spam
  try {
    const headersList = await headers();
    const ip = getClientIp(headersList);
    const rateLimitCheck = checkRateLimit(`recruitment:${ip}`, RATE_LIMITS.contact);
    if (!rateLimitCheck.allowed) {
      return {
        success: false,
        message: rateLimitMessage("contact", rateLimitCheck),
      };
    }
  } catch {
    // Si indisponible (ex: tests), continuer
  }

  // 3. Honeypot anti-bot
  const honeypot = formData.get("website_hp") as string | null;
  if (honeypot && honeypot.trim().length > 0) {
    logger.warn({ honeypot }, "Candidature interceptée par le honeypot anti-spam");
    return {
      success: true,
      message: "Votre candidature a été reçue avec succès.",
    };
  }

  // 4. Extraction des champs
  const full_name = (formData.get("full_name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const whatsapp = (formData.get("whatsapp") as string)?.trim() || phone;
  const email = (formData.get("email") as string)?.trim() || "";
  const position = (formData.get("position") as string)?.trim();
  const city = (formData.get("city") as string)?.trim();
  const experience = (formData.get("experience") as string)?.trim();
  const availability = (formData.get("availability") as string)?.trim();
  const message = (formData.get("message") as string)?.trim() || "";

  // 5. Validation Zod
  const parseResult = candidateSchema.safeParse({
    full_name,
    phone,
    whatsapp,
    email,
    position,
    city,
    experience,
    availability,
    message,
  });

  if (!parseResult.success) {
    const formattedErrors: Record<string, string> = {};
    for (const issue of parseResult.error.issues) {
      const field = issue.path[0] as string;
      if (field && !formattedErrors[field]) {
        formattedErrors[field] = issue.message;
      }
    }
    return {
      success: false,
      message: "Veuillez vérifier les informations renseignées.",
      errors: formattedErrors,
    };
  }

  const validData = parseResult.data;

  // 6. Traitement du fichier CV
  let cv_url: string | null = null;
  let cv_filename: string | null = null;

  const cvFile = formData.get("cv_file") as File | null;
  if (cvFile && typeof cvFile === "object" && cvFile.size > 0) {
    // Limite de taille max : 4 Mo
    const MAX_SIZE = 4 * 1024 * 1024;
    if (cvFile.size > MAX_SIZE) {
      return {
        success: false,
        message: "Le fichier du CV est trop volumineux (maximum 4 Mo).",
        errors: { cv_file: "Taille maximale : 4 Mo" },
      };
    }

    // Types autorisés
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(cvFile.type)) {
      return {
        success: false,
        message: "Format de CV non supporté. Veuillez joindre un PDF, Word ou une image claire.",
        errors: { cv_file: "Formats acceptés : PDF, Word (.doc, .docx), JPG, PNG." },
      };
    }

    try {
      const arrayBuffer = await cvFile.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      cv_url = `data:${cvFile.type};base64,${base64}`;
      cv_filename = cvFile.name || "cv_candidat.pdf";
    } catch (err) {
      logger.error({ err }, "Erreur conversion fichier CV");
    }
  }

  // 7. Enregistrement de la candidature
  try {
    const saved = await saveCandidate({
      full_name: validData.full_name,
      phone: validData.phone,
      whatsapp: validData.whatsapp || validData.phone,
      email: validData.email || null,
      position: validData.position,
      city: validData.city,
      experience: validData.experience,
      availability: validData.availability,
      message: validData.message || null,
      cv_url,
      cv_filename,
    });

    return {
      success: true,
      candidateId: saved.id,
      message:
        "Votre candidature a été transmise avec succès ! L'équipe SAMBA FITNESS examinera attentivement votre profil et vous recontactera.",
    };
  } catch (err) {
    logger.error({ err }, "Erreur enregistrement candidature");
    return {
      success: false,
      message:
        "Une erreur technique est survenue. Veuillez réessayer ou contacter directement la salle sur WhatsApp.",
    };
  }
}

// ── ACTIONS ADMIN POUR LA GESTION DES CANDIDATURES ────────────

export async function fetchCandidatesAction(): Promise<{
  success: boolean;
  candidates: Candidate[];
  error?: string;
}> {
  const admin = await getAdminContext();
  if (!admin) {
    return { success: false, candidates: [], error: "Accès non autorisé" };
  }

  try {
    const list = await getCandidates();
    return { success: true, candidates: list };
  } catch (err) {
    logger.error({ err }, "Erreur récupération candidatures");
    return { success: false, candidates: [], error: "Impossible de charger les candidatures" };
  }
}

export async function updateCandidateStatusAction(
  id: string,
  status: CandidateStatus
): Promise<{ success: boolean; error?: string }> {
  const admin = await getAdminContext();
  if (!admin) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    await updateCandidateStatus(id, status);
    return { success: true };
  } catch (err) {
    logger.error({ err, id }, "Erreur mise à jour statut candidature");
    return { success: false, error: "Échec de la mise à jour" };
  }
}

export async function updateCandidateNotesAction(
  id: string,
  notes: string
): Promise<{ success: boolean; error?: string }> {
  const admin = await getAdminContext();
  if (!admin) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    await updateCandidateNotes(id, notes);
    return { success: true };
  } catch (err) {
    logger.error({ err, id }, "Erreur mise à jour notes candidature");
    return { success: false, error: "Échec de l'enregistrement de la note" };
  }
}

export async function deleteCandidateAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const admin = await getAdminContext();
  if (!admin) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    await deleteCandidate(id);
    return { success: true };
  } catch (err) {
    logger.error({ err, id }, "Erreur suppression candidature");
    return { success: false, error: "Échec de la suppression" };
  }
}

