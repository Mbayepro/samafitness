import { describe, it, expect, beforeEach, vi } from "vitest";
import { submitTrialAction } from "./submit-trial";
import { resetRateLimitStore } from "@/lib/rate-limit";

vi.mock("@/lib/leads-store", () => ({
  saveLead: vi.fn().mockResolvedValue({ id: "mock_lead_1", name: "Ousmane Diallo" }),
}));

describe("submitTrialAction", () => {
  beforeEach(() => {
    resetRateLimitStore();
    vi.clearAllMocks();
  });

  it("rejette un formulaire avec des champs manquants ou invalides", async () => {
    const formData = new FormData();
    formData.set("name", "A"); // Trop court
    formData.set("phone", "123"); // Numéro invalide
    formData.set("salle", "Inconnue");

    const result = await submitTrialAction({ success: false }, formData);
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors?.name).toBeDefined();
    expect(result.errors?.phone).toBeDefined();
  });

  it("valide et enregistre un formulaire correct", async () => {
    const formData = new FormData();
    formData.set("name", "Ousmane Diallo");
    formData.set("phone", "+221 77 000 11 22");
    formData.set("salle", "Ndioum");
    formData.set("message", "Demande d'information tarif");

    const result = await submitTrialAction({ success: false }, formData);
    expect(result.success).toBe(true);
    expect(result.message).toContain("Votre demande");
  });

  it("intercepte les robots lorsque le honeypot est rempli", async () => {
    const formData = new FormData();
    formData.set("name", "Bot Spammer");
    formData.set("phone", "+221 77 000 11 22");
    formData.set("salle", "Ndioum");
    formData.set("website_hp", "https://spam-site.com");

    const result = await submitTrialAction({ success: false }, formData);
    expect(result.success).toBe(true);
    const { saveLead } = await import("@/lib/leads-store");
    expect(saveLead).not.toHaveBeenCalled();
  });
});
