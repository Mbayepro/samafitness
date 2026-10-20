import { describe, it, expect, beforeEach } from "vitest";
import { submitTrialAction } from "./submit-trial";
import { resetRateLimitStore } from "@/lib/rate-limit";

describe("submitTrialAction", () => {
  beforeEach(() => {
    resetRateLimitStore();
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
});
