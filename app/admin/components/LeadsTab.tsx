"use client";

import { useState } from "react";
import { Inbox, Phone, Archive } from "lucide-react";
import type { Lead } from "@/lib/leads-store";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { formatAdminDate } from "./ui/AdminFormatters";

interface LeadsTabProps {
  leads: Lead[];
  isSuperAdmin: boolean;
  isPending: boolean;
  onRefresh: () => void;
  onExportCSV: () => void;
  onUpdateStatus: (id: string, status: Lead["status"]) => void;
  onArchiveSelected?: (ids: string[]) => void;
  onDeleteLead: (id: string, name: string) => void;
  onStartConvertLead: (lead: Lead) => void;
}

export default function LeadsTab({
  leads,
  isSuperAdmin,
  isPending,
  onRefresh,
  onExportCSV,
  onUpdateStatus,
  onArchiveSelected,
  onDeleteLead,
  onStartConvertLead,
}: LeadsTabProps) {
  const [searchLead, setSearchLead] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredLeads = leads.filter((l) => {
    const matchesStatus =
      statusFilter === "all" ? true : l.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch =
      l.name.toLowerCase().includes(searchLead.toLowerCase()) ||
      l.phone.includes(searchLead) ||
      (l.message && l.message.toLowerCase().includes(searchLead.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const allFilteredSelected =
    filteredLeads.length > 0 &&
    filteredLeads.every((l) => selectedIds.includes(l.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLeads.map((l) => l.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleArchiveSelection = () => {
    if (!onArchiveSelected || selectedIds.length === 0) return;
    onArchiveSelected(selectedIds);
    setSelectedIds([]);
  };

  return (
    <div className="mt-6 space-y-4">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-white/10 bg-[#121212] p-4 sm:p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-white/40">Total Demandes</p>
          <p className="mt-1 text-2xl font-black text-white sm:text-3xl">{leads.length}</p>
        </div>
        <div className="rounded-2xl border border-lime-400/30 bg-lime-400/5 p-4 sm:p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-lime-400">À Contacter</p>
          <p className="mt-1 text-2xl font-black text-lime-400 sm:text-3xl">
            {leads.filter((l) => l.status === "nouveau").length}
          </p>
        </div>
        <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/5 p-4 sm:p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">Contactés</p>
          <p className="mt-1 text-2xl font-black text-cyan-400 sm:text-3xl">
            {leads.filter((l) => l.status === "contacté").length}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/5 p-4 sm:p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Inscrits</p>
          <p className="mt-1 text-2xl font-black text-emerald-400 sm:text-3xl">
            {leads.filter((l) => l.status === "inscrit").length}
          </p>
        </div>
      </div>

      {/* Unified Leads Card: Filters + Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#121212]">
        {/* Toolbar Header */}
        <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex flex-1 flex-wrap items-center gap-2.5">
            <input
              type="text"
              placeholder="Rechercher par nom, tél..."
              value={searchLead}
              onChange={(e) => setSearchLead(e.target.value)}
              className="w-full sm:w-64 rounded-xl border border-white/10 bg-black/50 px-3.5 py-2 text-xs text-white placeholder-white/30 focus:border-lime-400 focus:outline-none"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-white focus:border-lime-400 focus:outline-none"
            >
              <option value="all">Tous les statuts</option>
              <option value="nouveau">Nouveaux</option>
              <option value="contacté">Contactés</option>
              <option value="inscrit">Inscrits</option>
              <option value="archivé">Archivés</option>
            </select>

            {filteredLeads.length > 0 && (
              <label className="flex items-center gap-2 cursor-pointer rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white/80 hover:text-white">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded accent-lime-400 cursor-pointer"
                />
                <span>Tout sélectionner</span>
              </label>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {selectedIds.length > 0 && onArchiveSelected && (
              <button
                type="button"
                onClick={handleArchiveSelection}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500 hover:text-black transition"
                title="Archiver toutes les demandes sélectionnées"
              >
                <Archive size={14} strokeWidth={1.75} />
                <span>Archiver la sélection ({selectedIds.length})</span>
              </button>
            )}
            <button
              onClick={onRefresh}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/90 hover:bg-white/10 transition"
              title="Actualiser la liste"
            >
              Actualiser
            </button>
            <button
              onClick={onExportCSV}
              className="rounded-md bg-lime-400 px-3 py-1.5 text-xs font-semibold text-black hover:bg-lime-300 transition"
            >
              Exporter CSV
            </button>
          </div>
        </div>

        {/* Leads Table / List */}
        {filteredLeads.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-[6px] border border-white/5 bg-white/[0.02] text-zinc-400">
              <Inbox size={18} strokeWidth={1.75} />
            </div>
            <h3 className="mt-3 text-sm font-medium text-white">Aucune demande trouvée</h3>
            <p className="mt-1 text-xs text-white/50">
              {searchLead || statusFilter !== "all"
                ? "Aucun résultat ne correspond à votre filtre de recherche."
                : "Les personnes qui remplissent le formulaire sur le site apparaîtront ici."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredLeads.map((lead) => {
              const whatsappUrl = buildWhatsAppLink(
                lead.phone,
                `Bonjour ${lead.name}, c'est l'équipe SAMBAFITNESS de Ndioum suite à votre demande sur notre site. Quand seriez-vous disponible pour finaliser votre inscription ?`
              );
              const isSelected = selectedIds.includes(lead.id);

              return (
                <div
                  key={lead.id}
                  className={`flex flex-col gap-3 p-4 transition hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between sm:p-5 ${
                    isSelected ? "bg-white/[0.03]" : ""
                  }`}
                >
                  {/* Case à cocher & Info Prospect */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectOne(lead.id)}
                      className="mt-1 h-4 w-4 rounded accent-lime-400 cursor-pointer flex-shrink-0"
                      aria-label={`Sélectionner ${lead.name}`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-semibold text-white">{lead.name}</h4>
                        <span
                          className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${
                            lead.status === "nouveau"
                              ? "bg-lime-400/10 text-lime-400 border border-lime-400/30"
                              : lead.status === "contacté"
                              ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/30"
                              : lead.status === "inscrit"
                              ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/30"
                              : "bg-white/10 text-white/60 border border-white/15"
                          }`}
                        >
                          {lead.status}
                        </span>
                        <span className="text-[11px] font-mono text-white/40">
                          {formatAdminDate(lead.created_at)}
                        </span>
                      </div>

                      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs">
                        <span className="font-mono font-bold text-white/90">{lead.phone}</span>
                        <span className="text-white/30">•</span>
                        <span className="text-white/60">{lead.club}</span>
                      </div>

                      {lead.message && (
                        <p className="mt-2 rounded-xl border border-white/5 bg-black/40 p-2.5 text-xs text-white/70 italic">
                          « {lead.message} »
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Rapides */}
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={`tel:${lead.phone}`}
                      className="inline-flex items-center gap-1.5 rounded-[6px] border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-white hover:border-white/40 transition min-h-[36px]"
                      title="Appeler directement"
                    >
                      <Phone size={14} strokeWidth={1.75} />
                      <span>Appeler</span>
                    </a>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#20ba59] transition"
                      title="Ouvrir WhatsApp avec un message pré-rempli"
                    >
                      WhatsApp
                    </a>

                    {lead.status !== "inscrit" && (
                      <button
                        onClick={() => onStartConvertLead(lead)}
                        className="rounded-md border border-lime-400/40 bg-lime-400/10 px-2.5 py-1.5 text-xs font-semibold text-lime-400 hover:bg-lime-400 hover:text-black transition"
                        title="Convertir ce prospect en membre adhérent"
                      >
                        + Membre
                      </button>
                    )}

                    <select
                      disabled={isPending}
                      value={lead.status}
                      onChange={(e) =>
                        onUpdateStatus(lead.id, e.target.value as Lead["status"])
                      }
                      className="rounded-md border border-white/15 bg-black/70 px-2.5 py-1.5 text-xs font-medium text-white focus:outline-none"
                    >
                      <option value="nouveau">Nouveau</option>
                      <option value="contacté">Contacté</option>
                      <option value="inscrit">Inscrit</option>
                      <option value="archivé">Archivé</option>
                    </select>

                    {isSuperAdmin && (
                      <button
                        disabled={isPending}
                        onClick={() => onDeleteLead(lead.id, lead.name)}
                        className="rounded-md border border-red-500/25 bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500 hover:text-white transition"
                        title="Supprimer la demande"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
