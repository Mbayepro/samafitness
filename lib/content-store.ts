import { SITE_DATA } from "@/lib/site-data";
import { createClient, createPublicServerClient } from "@/lib/supabase/server";
import { createJsonFileStore, runSupabase } from "@/lib/sync-store";
import { logger } from "@/lib/logger";

export type SiteContentType = typeof SITE_DATA;

const contentFileStore = createJsonFileStore<Partial<SiteContentType> | null>({
  relativePath: "data/site-content.json",
  empty: null,
});

export async function getSiteContent(): Promise<SiteContentType> {
  const localOverrides = contentFileStore.read();

  // Si Supabase est configuré, on vérifie s'il y a des paramètres distants
  const remoteSettings = await runSupabase("getSiteContent", async () => {
    const supabase = createPublicServerClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("content")
      .eq("id", "current")
      .single();

    if (!error && data?.content) {
      return data.content as Partial<SiteContentType>;
    }
    return null;
  });

  if (remoteSettings) {
    return {
      ...SITE_DATA,
      ...localOverrides,
      ...remoteSettings,
      shop: {
        ...SITE_DATA.shop,
        ...(localOverrides?.shop || {}),
        ...(remoteSettings.shop || {}),
        items:
          remoteSettings.shop?.items ||
          localOverrides?.shop?.items ||
          SITE_DATA.shop.items,
      },
    };
  }

  if (localOverrides) {
    return {
      ...SITE_DATA,
      ...localOverrides,
      brand: { ...SITE_DATA.brand, ...(localOverrides.brand || {}) },
      contact: { ...SITE_DATA.contact, ...(localOverrides.contact || {}) },
      salles: localOverrides.salles || SITE_DATA.salles,
      plans: localOverrides.plans || SITE_DATA.plans,
      coaches: localOverrides.coaches || SITE_DATA.coaches,
      faq: localOverrides.faq || SITE_DATA.faq,
      services: localOverrides.services || SITE_DATA.services,
      shop: {
        ...SITE_DATA.shop,
        ...(localOverrides.shop || {}),
        items: localOverrides.shop?.items || SITE_DATA.shop.items,
      },
    };
  }

  return SITE_DATA;
}

export async function updateSiteContent(
  updates: Partial<SiteContentType>
): Promise<SiteContentType> {
  const current = await getSiteContent();
  const merged: SiteContentType = {
    ...current,
    ...updates,
    brand: { ...current.brand, ...(updates.brand || {}) },
    contact: { ...current.contact, ...(updates.contact || {}) },
    salles: updates.salles || current.salles,
    plans: updates.plans || current.plans,
    coaches: updates.coaches || current.coaches,
    faq: updates.faq || current.faq,
    services: updates.services || current.services,
    shop: updates.shop
      ? {
          ...current.shop,
          ...updates.shop,
          items: updates.shop.items || current.shop.items,
        }
      : current.shop,
  };

  // Mettre à jour l'adresse et le téléphone dans contact & salles
  if (updates.contact?.phone || updates.contact?.address || updates.contact?.city) {
    const mainSalle = merged.salles[0];
    if (mainSalle) {
      if (updates.contact?.phone) {
        mainSalle.phone = updates.contact.phone;
      }
      if (updates.contact?.address) {
        mainSalle.address = updates.contact.address;
      }
      if (updates.contact?.city) {
        mainSalle.city = updates.contact.city;
      }
      if (updates.contact?.hoursText) {
        mainSalle.hours.weekdays = updates.contact.hoursText;
        mainSalle.hours.saturday = updates.contact.hoursText;
        mainSalle.hours.sunday = updates.contact.hoursText;
      }
    }
  }

  // 1. Sauvegarde locale
  contentFileStore.write(merged);

  // 2. Sauvegarde Supabase si configuré
  await runSupabase("updateSiteContent", async () => {
    const supabase = await createClient();
    await supabase.from("site_settings").upsert({
      id: "current",
      content: merged,
      updated_at: new Date().toISOString(),
    });
    return true;
  });

  logger.info("Contenu du site mis à jour");
  return merged;
}

export async function resetSiteContent(): Promise<SiteContentType> {
  contentFileStore.write(null);

  await runSupabase("resetSiteContent", async () => {
    const supabase = await createClient();
    await supabase.from("site_settings").delete().eq("id", "current");
    return true;
  });

  logger.info("Contenu du site réinitialisé aux valeurs par défaut");
  return SITE_DATA;
}
