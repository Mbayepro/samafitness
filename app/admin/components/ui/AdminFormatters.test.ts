import { describe, it, expect } from "vitest";
import {
  formatAdminDate,
  formatAdminFCFA,
  formatAmountForWhatsApp,
  formatAmountForExport,
} from "./AdminFormatters";

describe("AdminFormatters", () => {
  describe("formatAdminDate", () => {
    it("parse les chaînes YYYY-MM-DD manuellement sans décalage de fuseau", () => {
      expect(formatAdminDate("2026-12-31")).toBe("31/12/2026");
      expect(formatAdminDate("2026-01-01")).toBe("01/01/2026");
      expect(formatAdminDate("2026-05-15")).toBe("15/05/2026");
    });

    it("gère les chaînes ISO complètes", () => {
      expect(formatAdminDate("2026-06-10T14:30:00.000Z")).toBe("10/06/2026");
    });

    it("gère les valeurs nulles ou invalides", () => {
      expect(formatAdminDate(null)).toBe("-");
      expect(formatAdminDate(undefined)).toBe("-");
      expect(formatAdminDate("")).toBe("-");
    });
  });

  describe("formatAdminFCFA", () => {
    it("formate les montants avec le suffixe FCFA et séparateurs de milliers", () => {
      const res = formatAdminFCFA(180000);
      expect(res).toContain("180");
      expect(res).toContain("000");
      expect(res).toContain("FCFA");
    });

    it("gère 0 et les valeurs falsy", () => {
      expect(formatAdminFCFA(0)).toContain("0 FCFA");
      expect(formatAdminFCFA(null)).toContain("0 FCFA");
    });
  });

  describe("formatAmountForWhatsApp", () => {
    it("utilise un espace ASCII normal pour l'encodage d'URL WhatsApp", () => {
      const res = formatAmountForWhatsApp(180000);
      expect(res).toBe("180 000 FCFA");
      expect(res.charCodeAt(3)).toBe(32); // Espace ASCII 0x20
    });
  });

  describe("formatAmountForExport", () => {
    it("renvoie le nombre brut entier pour les exports CSV", () => {
      expect(formatAmountForExport(180000)).toBe(180000);
      expect(formatAmountForExport(null)).toBe(0);
    });
  });
});
