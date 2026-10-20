import { describe, it, expect, vi, beforeEach } from "vitest";
import { getLeads, saveLead, updateLeadStatus, deleteLead } from "./leads-store";

describe("leads-store", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("enregistre un nouveau prospect et le retourne avec un id", async () => {
    const lead = await saveLead({
      name: "Amadou Diallo",
      phone: "+221 77 123 45 67",
      club: "Ndioum",
      message: "Je souhaite m'inscrire au forfait musculation",
    });

    expect(lead.id).toBeDefined();
    expect(lead.name).toBe("Amadou Diallo");
    expect(lead.status).toBe("nouveau");
    expect(lead.club).toBe("Ndioum");
  });

  it("met à jour le statut d'un prospect existant", async () => {
    const lead = await saveLead({
      name: "Fatou Sow",
      phone: "+221 78 987 65 43",
      club: "Ndioum",
    });

    const updated = await updateLeadStatus(lead.id, "contacté");
    expect(updated).toBe(true);

    const all = await getLeads();
    const found = all.find((l) => l.id === lead.id);
    expect(found?.status).toBe("contacté");
  });

  it("supprime un prospect existant", async () => {
    const lead = await saveLead({
      name: "Moussa Ba",
      phone: "+221 70 111 22 33",
      club: "Ndioum",
    });

    const deleted = await deleteLead(lead.id);
    expect(deleted).toBe(true);

    const all = await getLeads();
    expect(all.some((l) => l.id === lead.id)).toBe(false);
  });
});
