import { describe, it, expect } from "vitest";
import { getSiteContent, updateSiteContent, resetSiteContent } from "./content-store";
import { SITE_DATA } from "./site-data";

describe("content-store", () => {
  it("retourne les données de contenu par défaut", async () => {
    const content = await getSiteContent();
    expect(content.brand.name).toBe(SITE_DATA.brand.name);
    expect(content.salles.length).toBeGreaterThan(0);
  });

  it("met à jour et fusionne le contenu partiel", async () => {
    const updated = await updateSiteContent({
      brand: {
        ...SITE_DATA.brand,
        name: "SAMBA FITNESS TEST",
        slogan: "Salle de test",
      },
    });

    expect(updated.brand.name).toBe("SAMBA FITNESS TEST");
    expect(updated.brand.slogan).toBe("Salle de test");

    // Nettoyage / réinitialisation
    await resetSiteContent();
    const restored = await getSiteContent();
    expect(restored.brand.name).toBe(SITE_DATA.brand.name);
  });
});
