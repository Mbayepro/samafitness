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

const CANDIDATE_LEAD_PREFIX = "CANDIDATURE::";

function parseCandidateFromLead(row: {
  id: string;
  name: string;
  phone: string;
  club: string;
  message?: string | null;
  created_at: string;
}): Candidate | null {
  if (!row.club?.startsWith(CANDIDATE_LEAD_PREFIX)) return null;
  if (row.message) {
    try {
      const parsed = JSON.parse(row.message) as Candidate;
      if (parsed && parsed.full_name && parsed.position) {
        return {
          ...parsed,
          id: row.id,
          created_at: parsed.created_at || row.created_at,
        };
      }
    } catch {
      // Ignorer si ce n'est pas du JSON valide
    }
  }
  const pos = (row.club.replace(CANDIDATE_LEAD_PREFIX, "") || "coach") as JobPosition;
  return {
    id: row.id,
    full_name: row.name,
    phone: row.phone,
    position: pos,
    position_label: JOB_POSITION_LABELS[pos] || pos,
    city: "Ndioum",
    experience: "Non précisé",
    availability: "Immédiate",
    message: row.message || null,
    status: "nouveau",
    created_at: row.created_at,
  };
}

export async function getCandidates(): Promise<Candidate[]> {
  const localCandidates = candidatesFileStore.read();

  const remoteCandidates = await runSupabase("getCandidates", async () => {
    const supabase = await createClient();
    const [{ data: jobApps, error: jobErr }, { data: leadRows }] = await Promise.all([
      supabase.from("job_applications").select("*").order("created_at", { ascending: false }),
      supabase
        .from("leads")
        .select("*")
        .like("club", `${CANDIDATE_LEAD_PREFIX}%`)
        .order("created_at", { ascending: false }),
    ]);

    const fromJobTable: Candidate[] =
      !jobErr && Array.isArray(jobApps) ? (jobApps as Candidate[]) : [];
    const fromLeadsFallback: Candidate[] = Array.isArray(leadRows)
      ? leadRows
          .map(parseCandidateFromLead)
          .filter((c): c is Candidate => c !== null)
      : [];

    if (jobErr && !Array.isArray(leadRows)) return null;
    return mergeById(fromJobTable, fromLeadsFallback);
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

  // 2. Sauvegarde Supabase si configuré (avec repli automatique sur public.leads si job_applications n'est pas encore créée)
  await runSupabase("saveCandidate", async () => {
    const supabase = await createClient();
    const { error } = await supabase.from("job_applications").insert([newCandidate]);
    if (error) {
      logger.warn(
        { error },
        "Table job_applications indisponible, repli automatique sur public.leads"
      );
      await supabase.from("leads").insert([
        {
          id: newCandidate.id,
          name: newCandidate.full_name,
          phone: newCandidate.phone,
          club: `${CANDIDATE_LEAD_PREFIX}${newCandidate.position}`,
          message: JSON.stringify(newCandidate),
          status: "nouveau",
          created_at: newCandidate.created_at,
        },
      ]);
    }
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
  const now = new Date().toISOString();
  const list = candidatesFileStore.read();
  const index = list.findIndex((c) => c.id === id);
  if (index !== -1) {
    list[index].status = status;
    list[index].updated_at = now;
    candidatesFileStore.write(list);
  }

  await runSupabase("updateCandidateStatus", async () => {
    const supabase = await createClient();
    const { error } = await supabase
      .from("job_applications")
      .update({ status, updated_at: now })
      .eq("id", id);

    if (error) {
      const { data: leadRow } = await supabase
        .from("leads")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (leadRow) {
        const parsed = parseCandidateFromLead(leadRow);
        if (parsed) {
          parsed.status = status;
          parsed.updated_at = now;
          await supabase
            .from("leads")
            .update({ message: JSON.stringify(parsed) })
            .eq("id", id);
        }
      }
    }
    return true;
  });

  return true;
}

export async function updateCandidateNotes(
  id: string,
  notes: string
): Promise<boolean> {
  const now = new Date().toISOString();
  const list = candidatesFileStore.read();
  const index = list.findIndex((c) => c.id === id);
  if (index !== -1) {
    list[index].notes = notes;
    list[index].updated_at = now;
    candidatesFileStore.write(list);
  }

  await runSupabase("updateCandidateNotes", async () => {
    const supabase = await createClient();
    const { error } = await supabase
      .from("job_applications")
      .update({ notes, updated_at: now })
      .eq("id", id);

    if (error) {
      const { data: leadRow } = await supabase
        .from("leads")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (leadRow) {
        const parsed = parseCandidateFromLead(leadRow);
        if (parsed) {
          parsed.notes = notes;
          parsed.updated_at = now;
          await supabase
            .from("leads")
            .update({ message: JSON.stringify(parsed) })
            .eq("id", id);
        }
      }
    }
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
    await Promise.all([
      supabase.from("job_applications").delete().eq("id", id),
      supabase.from("leads").delete().eq("id", id),
    ]);
    return true;
  });

  return true;
}

