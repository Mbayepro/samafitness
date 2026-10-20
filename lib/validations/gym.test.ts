import { describe, it, expect } from "vitest";
import {
  phoneRegex,
  trialFormSchema,
  memberSchema,
  paymentSchema,
  convertLeadSchema,
} from "./gym";

describe("Validations Samba Fitness", () => {
  describe("Validation Numéro de Téléphone (phoneRegex)", () => {
    it("doit accepter les numéros sénégalais avec ou sans indicatif", () => {
      expect(phoneRegex.test("771234567")).toBe(true);
      expect(phoneRegex.test("789573553")).toBe(true);
      expect(phoneRegex.test("+221789573553")).toBe(true);
      expect(phoneRegex.test("00221789573553")).toBe(true);
      expect(phoneRegex.test("338210000")).toBe(true);
    });

    it("doit refuser les numéros invalides ou trop courts", () => {
      expect(phoneRegex.test("12345")).toBe(false);
      expect(phoneRegex.test("abcdefgh")).toBe(false);
    });
  });

  describe("trialFormSchema (Formulaire public de contact / essai)", () => {
    it("doit valider une demande avec des données correctes", () => {
      const data = {
        name: "Abdoulaye Diallo",
        phone: "78 957 35 53",
        salle: "Samba Fitness Ndioum",
        message: "Je souhaite m'inscrire pour la musculation",
      };
      const res = trialFormSchema.safeParse(data);
      expect(res.success).toBe(true);
    });

    it("doit rejeter un nom trop court", () => {
      const res = trialFormSchema.safeParse({
        name: "A",
        phone: "789573553",
        salle: "Ndioum",
      });
      expect(res.success).toBe(false);
    });
  });

  describe("memberSchema (Création et modification adhérent)", () => {
    it("doit valider un adhérent complet", () => {
      const res = memberSchema.safeParse({
        full_name: "Ousmane Ba",
        phone: "+221789573553",
        plan_id: "mensuel",
        start_date: "2026-10-01",
        end_date: "2026-11-01",
      });
      expect(res.success).toBe(true);
    });

    it("doit refuser un adhérent sans date de fin", () => {
      const res = memberSchema.safeParse({
        full_name: "Ousmane Ba",
        phone: "+221789573553",
        plan_id: "mensuel",
        start_date: "2026-10-01",
      });
      expect(res.success).toBe(false);
    });
  });

  describe("paymentSchema (Enregistrement de paiement)", () => {
    it("doit valider un paiement Wave ou Orange Money conforme", () => {
      const res = paymentSchema.safeParse({
        member_id: "mem-12345",
        amount_fcfa: 15000,
        method: "Wave",
        period_start: "2026-10-01",
        period_end: "2026-10-31",
        note: "Abonnement mensuel",
      });
      expect(res.success).toBe(true);
    });

    it("doit refuser un montant négatif ou égal à zéro", () => {
      const res = paymentSchema.safeParse({
        member_id: "mem-12345",
        amount_fcfa: 0,
        method: "Espèces",
        period_start: "2026-10-01",
        period_end: "2026-10-31",
      });
      expect(res.success).toBe(false);
    });

    it("doit refuser un moyen de paiement non supporté", () => {
      const res = paymentSchema.safeParse({
        member_id: "mem-12345",
        amount_fcfa: 10000,
        method: "Cheque",
        period_start: "2026-10-01",
        period_end: "2026-10-31",
      });
      expect(res.success).toBe(false);
    });
  });

  describe("convertLeadSchema", () => {
    it("doit valider la conversion d'un lead en membre", () => {
      const res = convertLeadSchema.safeParse({
        leadId: "lead-001",
        full_name: "Fatou Ndiaye",
        phone: "776543210",
        plan_id: "mensuel",
        duration_months: 1,
        amount_fcfa: 15000,
        payment_method: "Orange Money",
      });
      expect(res.success).toBe(true);
    });
  });
});
