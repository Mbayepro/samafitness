"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Briefcase,
  Search,
  Phone,
  MessageSquare,
  FileText,
  Trash2,
  ExternalLink,
  Download,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  HelpCircle,
  Filter,
} from "lucide-react";
import type { Candidate, CandidateStatus } from "@/lib/candidates-store";
import {
  JOB_POSITIONS,
  JOB_POSITION_LABELS,
  type JobPosition,
} from "@/lib/validations/gym";
import { formatSenegalPhoneForWhatsApp } from "@/lib/whatsapp";
import type { FeedbackKind } from "@/app/admin/admin-types";
import {
  updateCandidateStatusAction,
  updateCandidateNotesAction,
  deleteCandidateAction,
} from "@/app/actions/recruitment-actions";

interface GymCandidatesTabProps {
  candidates: Candidate[];
  onRefresh: () => Promise<void>;
  showFeedback: (type: FeedbackKind, text: string) => void;
  isSuperAdmin: boolean;
}

const STATUS_CONFIG: Record<
  CandidateStatus,
  { label: string; color: string; bg: string; icon: typeof Clock }
> = {
  nouveau: {
    label: "Nouveau",
    color: "text-cyan-300",
    bg: "bg-cyan-500/15 border-cyan-500/30",
    icon: Clock,
  },
  contacte: {
    label: "Contacté",
    color: "text-amber-300",
    bg: "bg-amber-500/15 border-amber-500/30",
    icon: HelpCircle,
  },
  entretien: {
    label: "Entretien prévu",
    color: "text-purple-300",
    bg: "bg-purple-500/15 border-purple-500/30",
    icon: Calendar,
  },
  retenu: {
    label: "Retenu / Embauché",
    color: "text-lime-300",
    bg: "bg-lime-500/15 border-lime-500/30",
    icon: CheckCircle,
  },
  refuse: {
    label: "Non retenu",
    color: "text-red-300",
    bg: "bg-red-500/15 border-red-500/30",
    icon: XCircle,
  },
};

export default function GymCandidatesTab({
  candidates,
  onRefresh,
  showFeedback,
  isSuperAdmin,
}: GymCandidatesTabProps) {
  const [search, setSearch] = useState("");
  const [selectedPosition, setSelectedPosition] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [activeCandidateForNotes, setActiveCandidateForNotes] = useState<Candidate | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Filtrage
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      if (selectedPosition !== "all" && c.position !== selectedPosition) {
        return false;
      }
      if (selectedStatus !== "all" && c.status !== selectedStatus) {
        return false;
      }
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchName = c.full_name.toLowerCase().includes(query);
        const matchPhone = c.phone.includes(query);
        const matchCity = c.city.toLowerCase().includes(query);
        return matchName || matchPhone || matchCity;
      }
      return true;
    });
  }, [candidates, selectedPosition, selectedStatus, search]);

  // Changement de statut
  const handleStatusChange = async (id: string, newStatus: CandidateStatus) => {
    setIsUpdating(true);
    try {
      const res = await updateCandidateStatusAction(id, newStatus);
      if (res.success) {
        showFeedback("success", `Statut mis à jour : ${STATUS_CONFIG[newStatus].label}`);
        await onRefresh();
      } else {
        showFeedback("error", res.error || "Erreur de mise à jour");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Enregistrement des notes internes
  const handleSaveNotes = async () => {
    if (!activeCandidateForNotes) return;
    setIsUpdating(true);
    try {
      const res = await updateCandidateNotesAction(activeCandidateForNotes.id, noteDraft);
      if (res.success) {
        showFeedback("success", "Note interne enregistrée.");
        setActiveCandidateForNotes(null);
        await onRefresh();
      } else {
        showFeedback("error", res.error || "Erreur d'enregistrement");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Suppression
  const handleDelete = async (candidate: Candidate) => {
    if (
      !confirm(
        `Supprimer définitivement la candidature de ${candidate.full_name} (${candidate.position_label}) ?`
      )
    )
      return;

    try {
      const res = await deleteCandidateAction(candidate.id);
      if (res.success) {
        showFeedback("success", `Candidature de ${candidate.full_name} supprimée.`);
        await onRefresh();
      } else {
        showFeedback("error", res.error || "Erreur lors de la suppression");
      }
    } catch {
      showFeedback("error", "Erreur réseau");
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (candidates.length === 0) {
      alert("Aucune candidature à exporter.");
      return;
    }

    const headers = [
      "Date",
      "Nom complet",
      "Poste",
      "Téléphone",
      "WhatsApp",
      "Email",
      "Ville",
      "Expérience",
      "Disponibilité",
      "Statut",
      "CV joint",
      "Message",
      "Notes",
    ];

    const rows = candidates.map((c) => [
      new Date(c.created_at).toLocaleString("fr-FR"),
      `"${c.full_name.replace(/"/g, '""')}"`,
      `"${c.position_label}"`,
      `"${c.phone}"`,
      `"${c.whatsapp || ""}"`,
      `"${c.email || ""}"`,
      `"${c.city.replace(/"/g, '""')}"`,
      `"${c.experience.replace(/"/g, '""')}"`,
      `"${c.availability.replace(/"/g, '""')}"`,
      `"${STATUS_CONFIG[c.status]?.label || c.status}"`,
      c.cv_url ? "Oui" : "Non",
      `"${(c.message || "").replace(/"/g, '""')}"`,
      `"${(c.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `candidatures_sambafitness_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* ── EN-TÊTE DE SECTION ───────────────────────────────────────── */}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#121214] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black uppercase text-white flex items-center gap-2 sm:text-lg">
              <Briefcase size={18} className="text-lime-400" />
              <span>Candidatures & Recrutement</span>
            </h2>
            <span className="rounded-full border border-lime-400/40 bg-lime-400/10 px-2.5 py-0.5 font-mono text-xs font-bold text-lime-400">
              {candidates.length} reçu(s)
            </span>
          </div>
          <p className="text-xs text-white/50">
            Campagne du 1er au 20 novembre 2026 • Formulaire natif en ligne Samba Fitness.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/recrutement"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/10 transition"
          >
            <span>Voir la page publique</span>
            <ExternalLink size={13} />
          </Link>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-lime-400/40 bg-lime-400/10 px-3.5 py-2 text-xs font-bold text-lime-400 hover:bg-lime-400 hover:text-black transition"
          >
            <Download size={13} />
            <span>Exporter CSV</span>
          </button>
        </div>
      </div>

      {/* ── BARRE DE FILTRES ET RECHERCHE ────────────────────────────── */}
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#101012] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, téléphone, ville..."
            className="w-full rounded-xl border border-white/10 bg-black/50 py-2 pl-9 pr-4 text-xs text-white placeholder-white/30 focus:border-lime-400 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filtre Poste */}
          <div className="flex items-center gap-1.5">
            <Filter size={13} className="text-white/40" />
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="rounded-xl border border-white/10 bg-black/80 px-3 py-2 text-xs text-white focus:border-lime-400 focus:outline-none"
            >
              <option value="all">Tous les postes ({candidates.length})</option>
              {JOB_POSITIONS.map((pos) => (
                <option key={pos} value={pos}>
                  {JOB_POSITION_LABELS[pos]}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre Statut */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-white/10 bg-black/80 px-3 py-2 text-xs text-white focus:border-lime-400 focus:outline-none"
          >
            <option value="all">Tous les statuts</option>
            {Object.entries(STATUS_CONFIG).map(([stKey, cfg]) => (
              <option key={stKey} value={stKey}>
                {cfg.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── LISTE DES CANDIDATURES ──────────────────────────────────── */}
      {filteredCandidates.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center">
          <Briefcase size={32} className="mx-auto text-white/30" />
          <h3 className="mt-3 text-sm font-bold text-white">Aucune candidature trouvée</h3>
          <p className="mt-1 text-xs text-white/50">
            {search || selectedPosition !== "all" || selectedStatus !== "all"
              ? "Modifiez vos filtres ou termes de recherche."
              : "Les candidatures soumises sur la page /recrutement apparaîtront ici."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCandidates.map((c) => {
            const statusCfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.nouveau;
            const StatusIcon = statusCfg.icon;
            const cleanPhone = formatSenegalPhoneForWhatsApp(c.whatsapp || c.phone);
            const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
              `Bonjour ${c.full_name}, nous avons bien reçu votre candidature pour le poste de ${c.position_label} chez SAMBA FITNESS Ndioum.`
            )}`;

            return (
              <div
                key={c.id}
                className="rounded-2xl border border-white/10 bg-[#121214] p-5 transition hover:border-white/20 space-y-4"
              >
                {/* Ligne principale */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-bold text-white">{c.full_name}</h4>
                      <span className="rounded-md border border-lime-400/40 bg-lime-400/10 px-2.5 py-0.5 text-xs font-bold text-lime-400">
                        {c.position_label}
                      </span>
                      <span className="text-xs text-white/40">• {c.city}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
                      <span>
                        Expérience : <strong className="text-white/80">{c.experience}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Disponibilité :{" "}
                        <strong className="text-white/80">{c.availability}</strong>
                      </span>
                      <span>•</span>
                      <span className="font-mono text-[11px] text-white/40">
                        Reçu le {new Date(c.created_at).toLocaleDateString("fr-FR")} à{" "}
                        {new Date(c.created_at).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Sélecteur de statut */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold ${statusCfg.bg} ${statusCfg.color}`}
                    >
                      <StatusIcon size={13} />
                      <select
                        value={c.status}
                        disabled={isUpdating}
                        onChange={(e) =>
                          handleStatusChange(c.id, e.target.value as CandidateStatus)
                        }
                        className="bg-transparent font-bold focus:outline-none cursor-pointer"
                      >
                        {Object.entries(STATUS_CONFIG).map(([stKey, cfg]) => (
                          <option key={stKey} value={stKey} className="bg-[#18181b] text-white">
                            {cfg.label}
                          </option>
                        ))}
                      </select>
                    </span>
                  </div>
                </div>

                {/* Message du candidat */}
                {c.message && (
                  <div className="rounded-xl border border-white/5 bg-black/40 p-3 text-xs text-white/75 leading-relaxed">
                    <span className="font-bold text-white/50 block mb-1">
                      Motivation / Parcours :
                    </span>
                    &laquo; {c.message} &raquo;
                  </div>
                )}

                {/* Note interne si existante */}
                {c.notes && (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-200/90 leading-relaxed">
                    <span className="font-bold text-amber-400 block mb-0.5">
                      Note interne du club :
                    </span>
                    {c.notes}
                  </div>
                )}

                {/* Actions & Coordonnées */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Appel direct */}
                    <a
                      href={`tel:${c.phone}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/10 transition"
                    >
                      <Phone size={12} className="text-lime-400" />
                      <span>{c.phone}</span>
                    </a>

                    {/* WhatsApp */}
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/25 transition"
                    >
                      <MessageSquare size={12} />
                      <span>WhatsApp</span>
                    </a>

                    {/* Télécharger CV si présent */}
                    {c.cv_url ? (
                      <a
                        href={c.cv_url}
                        download={c.cv_filename || `cv_${c.full_name}.pdf`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/40 bg-cyan-400/15 px-3 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-400/25 transition"
                      >
                        <FileText size={12} />
                        <span>Télécharger le CV</span>
                      </a>
                    ) : (
                      <span className="text-[11px] text-white/35 italic">
                        Aucun fichier CV joint
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCandidateForNotes(c);
                        setNoteDraft(c.notes || "");
                      }}
                      className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition"
                    >
                      {c.notes ? "Modifier la note" : "+ Ajouter une note"}
                    </button>

                    {isSuperAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDelete(c)}
                        title="Supprimer la candidature"
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-white/40 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODALE NOTE INTERNE ──────────────────────────────────────── */}
      {activeCandidateForNotes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#141416] p-6 shadow-2xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">
                Note interne — {activeCandidateForNotes.full_name}
              </h3>
              <p className="text-xs text-white/50">
                Poste : {activeCandidateForNotes.position_label}. Visible uniquement par l&apos;équipe admin.
              </p>
            </div>

            <textarea
              rows={4}
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              placeholder="Ex : Bon contact téléphonique, disponible pour un entretien samedi matin à la salle..."
              className="w-full rounded-xl border border-white/15 bg-black/60 p-3 text-xs text-white placeholder-white/30 focus:border-lime-400 focus:outline-none"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveCandidateForNotes(null)}
                className="rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-white/70 hover:bg-white/10"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={handleSaveNotes}
                className="rounded-lg bg-lime-400 px-4 py-2 text-xs font-bold text-black hover:bg-lime-300 transition"
              >
                {isUpdating ? "Enregistrement..." : "Enregistrer la note"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

