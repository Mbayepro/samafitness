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

  it("rejette le pointage par QR avec un jeton invalide ou introuvable", async () => {
    vi.spyOn(adminAuth, "requireAdmin").mockResolvedValue({
      email: "admin@sambafitness.sn",
      role: "receptionist",
      isDemo: false,
    });

    const { checkInByQrTokenAction } = await import("./gym-actions");
    const res = await checkInByQrTokenAction("sfc_nonexistent_token_123456789");
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error).toMatch(/non reconnu|introuvable/i);
    }
  });

  it("rejette le pointage d'un membre expiré", async () => {
    vi.spyOn(adminAuth, "requireAdmin").mockResolvedValue({
      email: "admin@sambafitness.sn",
      role: "receptionist",
      isDemo: false,
    });

    const { checkInByQrTokenAction } = await import("./gym-actions");
    // mem_demo_3 (Ousmane Kane) a pour token sfc_b2c3d4e5f6a17890123456789abcdef2 et est expiré
    const res = await checkInByQrTokenAction("sfc_b2c3d4e5f6a17890123456789abcdef2");
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.isExpired).toBe(true);
      expect(res.error).toMatch(/expiré/i);
    }
  });

  it("régénère un nouveau jeton QR sécurisé de plus de 20 caractères", async () => {
    vi.spyOn(adminAuth, "requireAdmin").mockResolvedValue({
      email: "admin@sambafitness.sn",
      role: "receptionist",
      isDemo: false,
    });

    const { regenerateMemberQrTokenAction } = await import("./gym-actions");
    const res = await regenerateMemberQrTokenAction("mem_demo_1");
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.member.qr_token).toBeDefined();
      expect(res.member.qr_token?.startsWith("sfc_")).toBe(true);
      expect((res.member.qr_token?.length || 0)).toBeGreaterThanOrEqual(20);
    }
  });
});
