import { describe, it, expect, vi } from "vitest";
import { fetchGymDataAction, saveMemberAction } from "./gym-actions";
import * as adminAuth from "@/lib/auth/admin";

describe("gym-actions", () => {
  it("bloque l'accès aux données gym si non authentifié", async () => {
    vi.spyOn(adminAuth, "requireAdmin").mockRejectedValueOnce(
      new adminAuth.AdminAuthError("Authentification requise.")
    );

    const res = await fetchGymDataAction();
    expect(res.success).toBe(false);
  });

  it("retourne les données de la salle si authentifié", async () => {
    vi.spyOn(adminAuth, "requireAdmin").mockResolvedValue({
      email: "admin@sambafitness.sn",
      role: "super_admin",
      isDemo: false,
    });

    const res = await fetchGymDataAction();
    expect(res.success).toBe(true);
    if (res.success) {
      expect(Array.isArray(res.members)).toBe(true);
      expect(Array.isArray(res.payments)).toBe(true);
      expect(Array.isArray(res.attendances)).toBe(true);
      expect(res.stats).toBeDefined();
    }
  });

  it("rejette l'enregistrement d'un membre avec des données incomplètes", async () => {
    vi.spyOn(adminAuth, "requireAdmin").mockResolvedValue({
      email: "admin@sambafitness.sn",
      role: "super_admin",
      isDemo: false,
    });

    const res = await saveMemberAction({
      full_name: "",
      phone: "123",
      plan_id: "muscu",
      start_date: "invalid",
      end_date: "invalid",
    });

    expect(res.success).toBe(false);
  });
});
