/**
 * Utilitaires de formatage standardisés pour l'espace d'administration.
 *
 * Règles :
 * - `formatAdminDate` : parsing manuel pour les dates YYYY-MM-DD afin d'éviter tout décalage horaire/fuseau.
 * - `formatAdminFCFA` : affichage soigné via Intl.NumberFormat('fr-FR').
 * - `formatAmountForWhatsApp` : espaces ASCII standards pour ne pas briser les liens WhatsApp.
 * - `formatAmountForExport` : nombre brut pour les exports CSV.
 */

/**
 * Formate une date en JJ/MM/AAAA.
 * Si une chaîne débute par YYYY-MM-DD, le découpage est fait manuellement sans instancier new Date()
 * pour éviter les décalages de fuseau UTC/local.
 */
export function formatAdminDate(date: string | Date | null | undefined): string {
  if (!date) return "-";

  if (typeof date === "string") {
    const trimmed = date.trim();
    // Format YYYY-MM-DD ou YYYY-MM-DDT...
    const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, year, month, day] = match;
      return `${day}/${month}/${year}`;
    }
    // Cas où la date est déjà au format JJ/MM/AAAA
    if (/^\d{2}\/\d{2}\/\d{4}/.test(trimmed)) {
      return trimmed.slice(0, 10);
    }
  }

  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Formate une date et heure en JJ/MM/AAAA à HH:MM.
 */
export function formatAdminDateTime(date: string | Date | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";

  const dateStr = formatAdminDate(d);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${dateStr} à ${hours}:${minutes}`;
}

/**
 * Formate un montant en FCFA pour l'affichage UI dans l'admin.
 * Exemple : 180000 => "180 000 FCFA" (avec séparateurs de milliers).
 */
export function formatAdminFCFA(amount: number | null | undefined): string {
  const safeAmount = Math.round(Number(amount) || 0);
  const formatted = new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(safeAmount);

  return `${formatted} FCFA`;
}

/**
 * Formate un montant pour les messages WhatsApp avec un espace ASCII standard (0x20),
 * évitant les espaces insécables qui corrompent l'encodage d'URL WhatsApp.
 */
export function formatAmountForWhatsApp(amount: number | null | undefined): string {
  const safeAmount = Math.round(Number(amount) || 0);
  const withAsciiSpaces = safeAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${withAsciiSpaces} FCFA`;
}

/**
 * Renvoie le nombre brut pour les exports CSV, sans unité ni séparateur de milliers.
 */
export function formatAmountForExport(amount: number | null | undefined): number {
  return Math.round(Number(amount) || 0);
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
