import { describe, it, expect, beforeEach, vi } from "vitest";
import { submitApplicationAction } from "./recruitment-actions";
import { resetRateLimitStore } from "@/lib/rate-limit";

vi.mock("@/lib/candidates-store", () => ({
  saveCandidate: vi.fn().mockImplementation((c) => Promise.resolve({ id: "mock_cand_1", ...c })),
  getCandidates: vi.fn().mockResolvedValue([]),
  updateCandidateStatus: vi.fn().mockResolvedValue(true),
  updateCandidateNotes: vi.fn().mockResolvedValue(true),
  deleteCandidate: vi.fn().mockResolvedValue(true),
}));

describe("submitApplicationAction", () => {
  beforeEach(() => {
    resetRateLimitStore();
    vi.clearAllMocks();
  });

  it("rejette un formulaire avec des champs manquants", async () => {
    const formData = new FormData();
    formData.set("full_name", "");
    formData.set("phone", "123");
    formData.set("position", "invalid_pos");

    const result = await submitApplicationAction({ success: false }, formData);
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors?.full_name).toBeDefined();
    expect(result.errors?.phone).toBeDefined();
  });

  it("valide et enregistre une candidature complète", async () => {
    const formData = new FormData();
    formData.set("full_name", "Amadou Sow");
    formData.set("phone", "+221 78 957 35 53");
    formData.set("whatsapp", "789573553");
    formData.set("position", "coach");
    formData.set("city", "Ndioum");
    formData.set("experience", "1 à 2 ans d'expérience");
    formData.set("availability", "Immédiate");
    formData.set("message", "Très motivé pour encadrer les membres en musculation.");

    const result = await submitApplicationAction({ success: false }, formData);
    expect(result.success).toBe(true);
    expect(result.candidateId).toBe("mock_cand_1");
    expect(result.message).toContain("succès");
  });

  it("bloque les robots spams via le honeypot", async () => {
    const formData = new FormData();
    formData.set("full_name", "Robot Spammer");
    formData.set("phone", "+221 78 957 35 53");
    formData.set("position", "coach");
    formData.set("website_hp", "spam_value");

    const result = await submitApplicationAction({ success: false }, formData);
    expect(result.success).toBe(true);
    const { saveCandidate } = await import("@/lib/candidates-store");
    expect(saveCandidate).not.toHaveBeenCalled();
  });
});

