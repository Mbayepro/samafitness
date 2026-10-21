"use client";

import { useState, useEffect } from "react";
import { Users, X } from "lucide-react";
import type { Member } from "@/lib/gym-store";
import type { Lead } from "@/lib/leads-store";
import MemberBadgeCardModal from "./MemberBadgeCardModal";
import GymRelancesTab from "./GymRelancesTab";
import LeadsTab from "./LeadsTab";
import { formatSenegalPhoneForWhatsApp } from "@/lib/whatsapp";
import { formatAdminDate, formatMemberNumber } from "./ui/AdminFormatters";

interface GymMembersTabProps {
  members: Member[];
  isSuperAdmin: boolean;
  onSaveMember: (
    data: Omit<Member, "id" | "status" | "created_at" | "updated_at"> & { id?: string }
  ) => Promise<void>;
  onDeleteMember: (id: string, name: string) => Promise<void>;
  onQuickCheckIn: (memberId: string) => Promise<void>;
  onOpenPaymentForMember: (member: Member) => void;
  showFeedback: (type: "success" | "error", text: string) => void;
  initialSubTab?: "list" | "relances" | "leads";
  leads?: Lead[];
  isPending?: boolean;
  onRefreshLeads?: () => void;
  onExportLeadsCSV?: () => void;
  onUpdateLeadStatus?: (id: string, status: Lead["status"]) => void;
  onArchiveBatchLeads?: (ids: string[]) => void;
  onDeleteLead?: (id: string, name: string) => void;
  onStartConvertLead?: (lead: Lead) => void;
}

export default function GymMembersTab({
  members,
  isSuperAdmin,
  onSaveMember,
  onDeleteMember,
  onQuickCheckIn,
  onOpenPaymentForMember,
  showFeedback,
  initialSubTab = "list",
  leads = [],
  isPending = false,
  onRefreshLeads = () => {},
  onExportLeadsCSV = () => {},
  onUpdateLeadStatus = () => {},
  onArchiveBatchLeads,
  onDeleteLead = () => {},
  onStartConvertLead = () => {},
}: GymMembersTabProps) {
  const [subTab, setSubTab] = useState<"list" | "relances" | "leads">(initialSubTab);

  useEffect(() => {
    setSubTab(initialSubTab);
  }, [initialSubTab]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [badgeMember, setBadgeMember] = useState<Member | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+221 ");
  const [planId, setPlanId] = useState("muscu-cardio");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");

  const openCreateModal = () => {
    setEditingMember(null);
    setFullName("");
    setPhone("+221 ");
    setPlanId("muscu-cardio");

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthStr = nextMonth.toISOString().split("T")[0];

    setStartDate(todayStr);
    setEndDate(nextMonthStr);
    setNotes("");
    setIsModalOpen(true);
  };

  const openEditModal = (member: Member) => {
    setEditingMember(member);
    setFullName(member.full_name);
    setPhone(member.phone);
    setPlanId(member.plan_id);
    setStartDate(member.start_date);
    setEndDate(member.end_date);
    setNotes(member.notes || "");
    setIsModalOpen(true);
  };

  const applyDuration = (months: number) => {
    const base = startDate ? new Date(startDate) : new Date();
    base.setMonth(base.getMonth() + months);
    setEndDate(base.toISOString().split("T")[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !endDate) {
      showFeedback("error", "Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setSaving(true);
    try {
      await onSaveMember({
        id: editingMember?.id,
        full_name: fullName.trim(),
        phone: phone.trim(),
        plan_id: planId,
        start_date: startDate || new Date().toISOString().split("T")[0],
        end_date: endDate,
        notes: notes.trim() || null,
        qr_token: editingMember?.qr_token,
      });
      setIsModalOpen(false);
      showFeedback("success", editingMember ? "Fiche membre modifiée." : "Nouveau membre inscrit avec succès !");
    } catch {
      showFeedback("error", "Impossible d'enregistrer le membre.");
    } finally {
      setSaving(false);
    }
  };

  const filteredMembers = members.filter((m) => {
    const matchesStatus =
      statusFilter === "all" ? true : m.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch =
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search) ||
      (m.notes && m.notes.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const relancesCount = members.filter(
    (m) => m.status === "expire" || m.status === "expire_bientot"
  ).length;

  return (
    <div className="space-y-6">
      {/* ── SOUS-ONGLETS MEMBRES (Tous / Relances / Demandes Web) ── */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto [scrollbar-width:none]">
        <button
          type="button"
          onClick={() => setSubTab("list")}
          className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition flex-shrink-0 ${
            subTab === "list"
              ? "bg-white text-black"
              : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          <span>Tous les adhérents</span>
          <span
            className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${
              subTab === "list" ? "bg-black/20 text-black" : "bg-white/10 text-white/70"
            }`}
          >
            {members.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("relances")}
          className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition flex-shrink-0 ${
            subTab === "relances"
              ? "bg-amber-400 text-black"
              : "border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
          }`}
        >
          <span>Relances</span>
          {relancesCount > 0 && (
            <span
              className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${
                subTab === "relances" ? "bg-black/20 text-black" : "bg-amber-400/20 text-amber-300"
              }`}
            >
              {relancesCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setSubTab("leads")}
          className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition flex-shrink-0 ${
            subTab === "leads"
              ? "bg-cyan-400 text-black"
              : "border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20"
          }`}
        >
          <span>Demandes Web</span>
          {leads.length > 0 && (
            <span
              className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${
                subTab === "leads" ? "bg-black/20 text-black" : "bg-cyan-400/20 text-cyan-300"
              }`}
            >
              {leads.length}
            </span>
          )}
        </button>
      </div>

      {/* ── VUE RELANCES ────────────────────────────────────────────── */}
      {subTab === "relances" && (
        <GymRelancesTab
          members={members}
          onOpenPaymentForMember={onOpenPaymentForMember}
        />
      )}

      {/* ── VUE DEMANDES WEB ────────────────────────────────────────── */}
      {subTab === "leads" && (
        <LeadsTab
          leads={leads}
          isSuperAdmin={isSuperAdmin}
          isPending={isPending}
          onRefresh={onRefreshLeads}
          onExportCSV={onExportLeadsCSV}
          onUpdateStatus={onUpdateLeadStatus}
          onArchiveSelected={onArchiveBatchLeads}
          onDeleteLead={onDeleteLead}
          onStartConvertLead={onStartConvertLead}
        />
      )}

      {/* ── VUE LISTE DES ADHÉRENTS ──────────────────────────────────── */}
      {subTab === "list" && (
        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#121212]">
          {/* ── BARRE D'OUTILS ET RECHERCHE INTÉGRÉE ────────────────── */}
          <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex flex-1 flex-wrap items-center gap-2.5">
              <input
                type="text"
                placeholder="Rechercher par nom, téléphone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64 rounded-md border border-white/10 bg-black/50 px-3.5 py-2 text-xs text-white placeholder-white/30 focus:border-white/30 focus:outline-none"
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md border border-white/10 bg-black/50 px-3 py-2 text-xs text-white focus:border-white/30 focus:outline-none"
              >
                <option value="all">Tous les statuts ({members.length})</option>
                <option value="actif">Actifs ({members.filter((m) => m.status === "actif").length})</option>
                <option value="expire_bientot">
                  Expire bientôt ({members.filter((m) => m.status === "expire_bientot").length})
                </option>
                <option value="expire">
                  Expirés ({members.filter((m) => m.status === "expire").length})
                </option>
              </select>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-md bg-lime-400 px-3.5 py-2 text-xs font-semibold text-black transition hover:bg-lime-300"
            >
              + Inscrire un membre
            </button>
          </div>

          {/* ── LISTE DES MEMBRES ─────────────────────────────────────── */}
          {filteredMembers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-[6px] border border-white/5 bg-white/[0.02] text-zinc-400">
                <Users size={18} strokeWidth={1.75} />
              </div>
              <h3 className="mt-3 text-sm font-medium text-white">Aucun membre trouvé</h3>
              <p className="mt-1 text-xs text-white/50">
                {search || statusFilter !== "all"
                  ? "Aucun résultat ne correspond à votre filtre."
                  : "Cliquez sur « Inscrire un Membre » pour ajouter votre premier adhérent."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-black/40 text-xs font-semibold text-white/60">
                    <th className="py-3 px-6">Adhérent</th>
                    <th className="py-3 px-4">Formule</th>
                    <th className="py-3 px-4">Période</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {filteredMembers.map((member) => {
                    const whatsappNumber = formatSenegalPhoneForWhatsApp(member.phone);
                    const whatsappMsg = encodeURIComponent(
                      `Bonjour ${member.full_name}, c'est Samba Diop de Samba Fitness Ndioum.`
                    );

                  return (
                    <tr
                      key={member.id}
                      className="transition hover:bg-white/[0.02]"
                    >
                      {/* Nom & Téléphone */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{member.full_name}</span>
                          <span className="font-mono text-[10px] text-lime-400 font-semibold rounded bg-lime-400/10 border border-lime-400/25 px-1.5 py-0.5">
                            {formatMemberNumber(member.member_number, member.id)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[11px] text-white/50">{member.phone}</span>
                          <a
                            href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 hover:bg-emerald-500 hover:text-black transition"
                            title="Ouvrir WhatsApp"
                          >
                            WhatsApp
                          </a>
                        </div>
                        {member.notes && (
                          <p className="mt-1 text-[11px] text-white/40 italic">{member.notes}</p>
                        )}
                      </td>

                      {/* Formule */}
                      <td className="py-4 px-4">
                        <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-white/80 uppercase">
                          {member.plan_id}
                        </span>
                      </td>

                      {/* Période */}
                      <td className="py-4 px-4">
                        <div className="text-[11px] text-white/70">
                          Du <span className="font-mono">{formatAdminDate(member.start_date)}</span>
                        </div>
                        <div className="text-[11px] text-white/70">
                          Au <span className="font-mono font-bold text-white">{formatAdminDate(member.end_date)}</span>
                        </div>
                      </td>

                      {/* Statut */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium ${
                            member.status === "actif"
                              ? "bg-lime-400/10 text-lime-400 border border-lime-400/30"
                              : member.status === "expire_bientot"
                              ? "bg-amber-400/10 text-amber-300 border border-amber-400/30"
                              : "bg-red-400/10 text-red-400 border border-red-400/30"
                          }`}
                        >
                          {member.status === "actif"
                            ? "Actif"
                            : member.status === "expire_bientot"
                            ? "Expire bientôt"
                            : "Expiré"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-6 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Pointer présence */}
                          <button
                            onClick={() => onQuickCheckIn(member.id)}
                            className="rounded-md border border-lime-400/30 bg-lime-400/10 px-2.5 py-1 text-xs font-medium text-lime-400 hover:bg-lime-400 hover:text-black transition"
                            title="Enregistrer sa présence"
                          >
                            Pointer
                          </button>

                          {/* Badge / QR Code */}
                          <button
                            onClick={() => setBadgeMember(member)}
                            className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/90 hover:bg-white/10 transition"
                            title="Voir et imprimer la carte membre avec QR code"
                          >
                            Badge QR
                          </button>

                          {/* Encaisser / Prolonger */}
                          <button
                            onClick={() => onOpenPaymentForMember(member)}
                            className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 hover:bg-emerald-500 hover:text-black transition"
                            title="Encaisser un paiement / Prolonger"
                          >
                            Paiement
                          </button>

                          {/* Modifier */}
                          <button
                            onClick={() => openEditModal(member)}
                            className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/70 hover:text-white transition"
                            title="Modifier"
                          >
                            Modifier
                          </button>

                          {/* Supprimer (Super Admin) */}
                          {isSuperAdmin && (
                            <button
                              onClick={() => {
                                if (confirm(`Supprimer définitivement le membre ${member.full_name} ?`)) {
                                  onDeleteMember(member.id, member.full_name);
                                }
                              }}
                              className="rounded-md border border-red-500/20 bg-red-500/5 px-2.5 py-1 text-xs text-red-400 hover:bg-red-500 hover:text-white transition"
                              title="Supprimer le membre"
                            >
                              Supprimer
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )}

      {/* ── MODAL NOUVEAU / MODIFIER MEMBRE ───────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-white/15 bg-[#121212] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-black uppercase text-white">
                {editingMember ? "Modifier la fiche membre" : "Inscrire un nouveau membre"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Fermer"
                className="rounded-[6px] p-2 text-white/50 hover:bg-white/10 hover:text-white transition"
              >
                <X size={16} strokeWidth={1.75} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/70">
                  Nom et prénom complet *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Moussa Diop"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-2.5 text-xs text-white placeholder-white/30 focus:border-lime-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/70">
                  Numéro de téléphone (Sénégal) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+221 77 123 45 67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-2.5 text-xs text-white placeholder-white/30 focus:border-lime-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/70">
                  Formule d&apos;abonnement
                </label>
                <select
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-2.5 text-xs text-white focus:border-lime-400 focus:outline-none"
                >
                  <option value="muscu-cardio">Muscu & Cardio (Essentiel)</option>
                  <option value="complete">Formule Complète (Tout inclus)</option>
                  <option value="coaching">Coaching personnalisé</option>
                  <option value="mensuel">Forfait Mensuel simple</option>
                  <option value="trimestriel">Forfait Trimestriel (3 mois)</option>
                  <option value="annuel">Forfait Annuel (12 mois)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/70">
                    Date début
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs text-white focus:border-lime-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/70">
                    Date d&apos;expiration *
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs text-white focus:border-lime-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Raccourcis de durée */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] uppercase font-bold text-white/40">Prolonger :</span>
                <button
                  type="button"
                  onClick={() => applyDuration(1)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-white hover:border-lime-400 hover:text-lime-400"
                >
                  +1 mois
                </button>
                <button
                  type="button"
                  onClick={() => applyDuration(3)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-white hover:border-lime-400 hover:text-lime-400"
                >
                  +3 mois
                </button>
                <button
                  type="button"
                  onClick={() => applyDuration(12)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-white hover:border-lime-400 hover:text-lime-400"
                >
                  +1 an
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/70">
                  Notes / Remarques (optionnel)
                </label>
                <textarea
                  rows={2}
                  placeholder="Objectif, créneau préféré, informations médicales..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-2 text-xs text-white placeholder-white/30 focus:border-lime-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-white/15 px-4 py-2.5 text-xs font-bold text-white/70 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-lime-400 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-black hover:bg-lime-300 disabled:opacity-50"
                >
                  {saving ? "Enregistrement..." : editingMember ? "Mettre à jour" : "Inscrire"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Badge & QR Code Modal */}
      {badgeMember && (
        <MemberBadgeCardModal
          member={badgeMember}
          onClose={() => setBadgeMember(null)}
          onMemberUpdated={(updated) => setBadgeMember(updated)}
        />
      )}
    </div>
  );
}
