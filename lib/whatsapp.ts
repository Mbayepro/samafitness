/**
 * Utilitaires pour formater les numéros de téléphone sénégalais et générer des liens WhatsApp.
 */

/**
 * Nettoie et formate un numéro de téléphone au format international sénégalais pour WhatsApp :
 * indicatif 221, sans '+' ni espaces ni tirets.
 * Exemples :
 * - "+221 77 036 26 16" -> "221770362616"
 * - "77 036 26 16"      -> "221770362616"
 * - "00221789573553"    -> "221789573553"
 */
export function formatSenegalPhoneForWhatsApp(phone: string): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("00221")) {
    return digits.slice(2);
  }
  if (digits.startsWith("221") && digits.length >= 12) {
    return digits;
  }
  if (digits.length === 9) {
    return `221${digits}`;
  }
  if (digits.length === 10 && digits.startsWith("0")) {
    return `221${digits.slice(1)}`;
  }
  return digits;
}

/**
 * Construit un lien wa.me avec un message de relance pré-rempli pour Samba Fitness.
 */
export function buildWhatsAppReminderUrl(
  phone: string,
  memberName: string,
  endDate?: string
): string {
  const cleanPhone = formatSenegalPhoneForWhatsApp(phone);
  if (!cleanPhone) return "#";

  let dateInfo = "arrive à échéance";
  if (endDate) {
    try {
      const d = new Date(endDate);
      if (!isNaN(d.getTime())) {
        dateInfo = `a expiré le ${d.toLocaleDateString("fr-SN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })}`;
      }
    } catch {
      // Fallback
    }
  }

  const message = `Bonjour ${memberName},\n\nVotre abonnement chez SAMBA FITNESS Ndioum ${dateInfo}.\nPour continuer à vous entraîner sans interruption, pensez à le renouveler à l'accueil de la salle.\n\nÀ très vite ! 💪\nSAMBA FITNESS Ndioum`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Construit un lien wa.me générique avec un message quelconque.
 */
export function buildWhatsAppLink(phone: string, text: string): string {
  const cleanPhone = formatSenegalPhoneForWhatsApp(phone);
  if (!cleanPhone) return "#";
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

