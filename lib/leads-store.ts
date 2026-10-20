import { createClient } from "@/lib/supabase/server";
import { createJsonFileStore, mergeById, runSupabase } from "@/lib/sync-store";
import { logger } from "@/lib/logger";

export interface Lead {
  id: string;
  name: string;
  phone: string;
  club: string;
  message?: string | null;
  created_at: string;
  status: "nouveau" | "contacté" | "inscrit" | "archivé";
}

// Le fichier local ne sert qu'au développement : en production, les prospects sont dans Supabase
const leadsFileStore = createJsonFileStore<Lead[]>({
  relativePath: "data/leads.json",
  empty: [],
});

export async function getLeads(): Promise<Lead[]> {
  const localLeads = leadsFileStore.read();

  const remoteLeads = await runSupabase("getLeads", async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || !Array.isArray(data)) return null;
    return data as Lead[];
  });

  const allLeads = remoteLeads ? mergeById(remoteLeads, localLeads) : localLeads;

  // Tri par date décroissante
  return allLeads.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function saveLead(
  lead: Omit<Lead, "id" | "created_at" | "status"> & Partial<Lead>
): Promise<Lead> {
  const newLead: Lead = {
    id: lead.id || `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: lead.name,
    phone: lead.phone,
    club: lead.club,
    message: lead.message || null,
    created_at: lead.created_at || new Date().toISOString(),
    status: lead.status || "nouveau",
  };

  // 1. Sauvegarde locale
  const leads = leadsFileStore.read();
  leads.unshift(newLead);
  leadsFileStore.write(leads);

  // 2. Sauvegarde Supabase si configuré
  await runSupabase("saveLead", async () => {
    const supabase = await createClient();
    await supabase.from("leads").insert([newLead]);
    return true;
  });

  logger.info({ leadId: newLead.id }, "Nouveau lead enregistré");
  return newLead;
}

export async function updateLeadStatus(id: string, status: Lead["status"]): Promise<boolean> {
  // 1. Mise à jour locale
  const leads = leadsFileStore.read();
  const index = leads.findIndex((l) => l.id === id);
  if (index !== -1) {
    leads[index].status = status;
    leadsFileStore.write(leads);
  }

  // 2. Mise à jour Supabase si configuré
  await runSupabase("updateLeadStatus", async () => {
    const supabase = await createClient();
    await supabase.from("leads").update({ status }).eq("id", id);
    return true;
  });

  return true;
}

export async function deleteLead(id: string): Promise<boolean> {
  // 1. Suppression locale
  const leads = leadsFileStore.read();
  const filtered = leads.filter((l) => l.id !== id);
  leadsFileStore.write(filtered);

  // 2. Suppression Supabase si configuré
  await runSupabase("deleteLead", async () => {
    const supabase = await createClient();
    await supabase.from("leads").delete().eq("id", id);
    return true;
  });

  return true;
}
