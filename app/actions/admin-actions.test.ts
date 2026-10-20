import { describe, it, expect, vi } from "vitest";
import {
  fetchAdminData,
  updateLeadStatusAction,
  createStaffAccountAction,
  deleteStaffAccountAction,
} from "./admin-actions";
import * as adminAuth from "@/lib/auth/admin";

describe("admin-actions", () => {
  it("bloque les accès non autorisés et retourne une erreur explicite", async () => {
    vi.spyOn(adminAuth, "requireAdmin").mockRejectedValueOnce(
      new adminAuth.AdminAuthError("Authentification requise.")
    );

    const res = await fetchAdminData();
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error).toBe("Authentification requise.");
    }
  });

  it("permet l'accès si l'administrateur est authentifié", async () => {
    vi.spyOn(adminAuth, "requireAdmin").mockResolvedValue({
      email: "admin@sambafitness.sn",
      role: "super_admin",
      isDemo: false,
    });

    const res = await fetchAdminData();
    expect(res.success).toBe(true);
    if (res.success) {
      expect(Array.isArray(res.leads)).toBe(true);
      expect(res.content).toBeDefined();
    }
  });

  it("rejette un statut de lead invalide", async () => {
    vi.spyOn(adminAuth, "requireAdmin").mockResolvedValue({
      email: "admin@sambafitness.sn",
      role: "super_admin",
      isDemo: false,
    });

    const res = await updateLeadStatusAction("lead_123", "statut_inconnu" as any);
    expect(res.success).toBe(false);
  });

  it("bloque la création d'un compte gérant si requireAdmin lève une erreur de rôle", async () => {
    vi.spyOn(adminAuth, "requireAdmin").mockRejectedValueOnce(
      new adminAuth.AdminAuthError("Accès refusé : cette action est réservée au super-administrateur.")
    );

    const res = await createStaffAccountAction({
      email: "nouveau@sambafitness.sn",
      password: "SuperPassword123!",
      role: "receptionist",
    });

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error).toContain("super-administrateur");
    }
  });

  it("bloque la révocation de son propre compte administrateur", async () => {
    vi.spyOn(adminAuth, "requireAdmin").mockResolvedValue({
      email: "admin@sambafitness.sn",
      role: "super_admin",
      isDemo: false,
    });

    const res = await deleteStaffAccountAction("admin@sambafitness.sn");

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error).toContain("propre compte");
    }
  });
});
