export type TabKey =
  | "overview"
  | "members"
  | "attendances"
  | "finances"
  | "settings"
  // Clés conservées pour compatibilité / sous-onglets
  | "payments"
  | "relances"
  | "leads"
  | "staff"
  | "site"
  | "club"
  | "plans"
  | "coach"
  | "faq"
  | "supabase";

export type FeedbackKind = "success" | "error";

export type AdminFeedback = { type: FeedbackKind; text: string } | null;
