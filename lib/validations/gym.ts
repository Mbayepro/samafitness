import { z } from "zod";

// Phone validation regex for Senegal (+221...) & International format
export const phoneRegex = /^(?:(?:\+|00)221)?(?:7[05678]|3[03])\d{7}$|^\+?\d{8,15}$/;

/**
 * Lead / Contact / Trial form schema
 */
export const trialFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Le nom complet doit comporter au moins 2 caractères.")
    .max(100, "Le nom complet ne peut pas dépasser 100 caractères."),
  phone: z
    .string()
    .trim()
    .refine(
      (val) => phoneRegex.test(val.replace(/[\s.-]+/g, "")),
      "Veuillez renseigner un numéro de téléphone valide (ex: 77 123 45 67 ou +221 78 957 35 53)."
    ),
  salle: z
    .string()
    .trim()
    .min(1, "Veuillez sélectionner une salle."),
  message: z
    .string()
    .trim()
    .max(1000, "Le message ne peut pas dépasser 1000 caractères.")
    .optional()
    .or(z.literal("")),
});

export type TrialFormInput = z.infer<typeof trialFormSchema>;

/**
 * Member Create / Update Schema
 */
export const memberSchema = z.object({
  id: z.string().optional(),
  member_number: z.number().int().positive().optional(),
  full_name: z
    .string()
    .trim()
    .min(2, "Le nom complet doit comporter au moins 2 caractères.")
    .max(100, "Le nom ne doit pas dépasser 100 caractères."),
  phone: z
    .string()
    .trim()
    .min(6, "Le numéro de téléphone doit comporter au moins 6 caractères.")
    .max(25, "Numéro de téléphone trop long."),
  email: z
    .string()
    .trim()
    .email("Adresse email invalide.")
    .optional()
    .or(z.literal("")),
  plan_id: z
    .string()
    .min(1, "Le forfait est obligatoire.")
    .default("mensuel"),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date début invalide (AAAA-MM-JJ)."),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date fin invalide (AAAA-MM-JJ)."),
  notes: z.string().max(500, "Note trop longue.").optional().or(z.literal("")),
  qr_code: z.string().optional(),
  qr_token: z.string().optional(),
});

export type MemberInput = z.infer<typeof memberSchema>;

/**
 * Payment Record Schema
 */
export const paymentSchema = z.object({
  member_id: z
    .string()
    .min(1, "Membre obligatoire."),
  amount_fcfa: z
    .number()
    .positive("Le montant doit être supérieur à 0 FCFA.")
    .max(10000000, "Montant excessif."),
  method: z.enum(["Espèces", "Wave", "Orange Money"]),
  period_start: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date début invalide (AAAA-MM-JJ)."),
  period_end: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date fin invalide (AAAA-MM-JJ)."),
  note: z.string().max(250, "Note trop longue.").optional().or(z.literal("")),
});

export type PaymentInput = z.infer<typeof paymentSchema>;

/**
 * Lead Conversion to Member Schema
 */
export const convertLeadSchema = z.object({
  leadId: z.string().min(1, "Identifiant lead requis."),
  full_name: z.string().trim().min(2, "Nom obligatoire (min 2 car.)."),
  phone: z.string().trim().min(6, "Numéro obligatoire."),
  plan_id: z.string().min(1, "Forfait requis."),
  duration_months: z.number().int().min(1).max(24).default(1),
  amount_fcfa: z.number().nonnegative().optional(),
  payment_method: z.enum(["Espèces", "Wave", "Orange Money"]).optional(),
});

export type ConvertLeadInput = z.infer<typeof convertLeadSchema>;

/**
 * Expense Record Schema
 */
export const EXPENSE_CATEGORIES = [
  "loyer",
  "electricite",
  "eau_internet",
  "salaires",
  "materiel",
  "maintenance",
  "autre",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const expenseSchema = z.object({
  amount_fcfa: z
    .number()
    .int("Le montant doit être un entier.")
    .positive("Le montant doit être supérieur à 0 FCFA.")
    .max(50000000, "Montant excessif."),
  category: z.enum(EXPENSE_CATEGORIES),
  description: z.string().trim().max(500, "Description trop longue.").optional().or(z.literal("")),
  paid_at: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (AAAA-MM-JJ)."),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;
