import { createClient } from "@/lib/supabase/server";
import { createJsonFileStore, mergeById, runSupabase } from "@/lib/sync-store";
import { logger } from "@/lib/logger";
import type { JobPosition } from "@/lib/validations/gym";
import { JOB_POSITION_LABELS } from "@/lib/validations/gym";

export type CandidateStatus = "nouveau" | "contacte" | "entretien" | "retenu" | "refuse";

export interface Candidate {
  id: string;
  full_name: string;
  phone: string;
  whatsapp?: string | null;
  email?: string | null;
  position: JobPosition;
  position_label: string;
  city: string;
  experience: string;
  availability: string;
  message?: string | null;
  cv_url?: string | null;
  cv_filename?: string | null;
  status: CandidateStatus;
  notes?: string | null;
  created_at: string;
  updated_at?: string;
}

const candidatesFileStore = createJsonFileStore<Candidate[]>({
  relativePath: "data/candidates.json",
  empty: [],
});

export async function getCandidates(): Promise<Candidate[]> {
  const localCandidates = candidatesFileStore.read();

  const remoteCandidates = await runSupabase("getCandidates", async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("job_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || !Array.isArray(data)) return null;
    return data as Candidate[];
  });

  const all = remoteCandidates ? mergeById(remoteCandidates, localCandidates) : localCandidates;

  return all.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function saveCandidate(
  input: Omit<Candidate, "id" | "position_label" | "status" | "created_at"> & {
    id?: string;
    status?: CandidateStatus;
  }
): Promise<Candidate> {
  const positionLabel = JOB_POSITION_LABELS[input.position] || input.position;
  const newCandidate: Candidate = {
    id: input.id || `cand_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    full_name: input.full_name,
    phone: input.phone,
    whatsapp: input.whatsapp || null,
    email: input.email || null,
    position: input.position,
    position_label: positionLabel,
    city: input.city,
    experience: input.experience,
    availability: input.availability,
    message: input.message || null,
    cv_url: input.cv_url || null,
    cv_filename: input.cv_filename || null,
    status: input.status || "nouveau",
    notes: null,
    created_at: new Date().toISOString(),
  };

  // 1. Sauvegarde locale
  const list = candidatesFileStore.read();
  list.unshift(newCandidate);
  candidatesFileStore.write(list);

  // 2. Sauvegarde Supabase si configuré
  await runSupabase("saveCandidate", async () => {
    const supabase = await createClient();
    await supabase.from("job_applications").insert([newCandidate]);
    return true;
  });

  logger.info(
    { candidateId: newCandidate.id, position: newCandidate.position },
    "Nouvelle candidature enregistrée"
  );
  return newCandidate;
}

export async function updateCandidateStatus(
  id: string,
  status: CandidateStatus
): Promise<boolean> {
  const list = candidatesFileStore.read();
  const index = list.findIndex((c) => c.id === id);
  if (index !== -1) {
    list[index].status = status;
    list[index].updated_at = new Date().toISOString();
    candidatesFileStore.write(list);
  }

  await runSupabase("updateCandidateStatus", async () => {
    const supabase = await createClient();
    await supabase
      .from("job_applications")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    return true;
  });

  return true;
}

export async function updateCandidateNotes(
  id: string,
  notes: string
): Promise<boolean> {
  const list = candidatesFileStore.read();
  const index = list.findIndex((c) => c.id === id);
  if (index !== -1) {
    list[index].notes = notes;
    list[index].updated_at = new Date().toISOString();
    candidatesFileStore.write(list);
  }

  await runSupabase("updateCandidateNotes", async () => {
    const supabase = await createClient();
    await supabase
      .from("job_applications")
      .update({ notes, updated_at: new Date().toISOString() })
      .eq("id", id);
    return true;
  });

  return true;
}

export async function deleteCandidate(id: string): Promise<boolean> {
  const list = candidatesFileStore.read();
  const filtered = list.filter((c) => c.id !== id);
  candidatesFileStore.write(filtered);

  await runSupabase("deleteCandidate", async () => {
    const supabase = await createClient();
    await supabase.from("job_applications").delete().eq("id", id);
    return true;
  });

  return true;
}

