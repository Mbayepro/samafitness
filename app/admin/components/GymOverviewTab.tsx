"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  X,
  AlertTriangle,
  Clock,
  CheckCircle2,
  UserCheck,
  ScanLine,
  UserPlus,
  CreditCard,
  CalendarCheck,
  Receipt,
} from "lucide-react";
import type { GymStats, Member, Attendance, Payment } from "@/lib/gym-store";
import type { Lead } from "@/lib/leads-store";
import type { TabKey, FeedbackKind } from "@/app/admin/admin-types";
import { buildWhatsAppReminderUrl } from "@/lib/whatsapp";
import { formatAdminDate, formatMemberNumber } from "./ui/AdminFormatters";

interface GymOverviewTabProps {
  stats: GymStats;
  members: Member[];
  payments?: Payment[];
  attendances: Attendance[];
  leads?: Lead[];
  isSuperAdmin?: boolean;
  onNavigateTab: (tab: TabKey) => void;
  onQuickCheckIn: (memberId: string) => Promise<boolean | void>;
  onOpenNewMemberModal: () => void;
  onOpenNewPaymentModal: (member?: Member) => void;
  onOpenScannerModal?: () => void;
  onSelectMemberDetails?: (member: Member) => void;
  showFeedback?: (type: FeedbackKind, text: string) => void;
}

export default function GymOverviewTab({
  stats,
  members,
  payments = [],
  attendances,
  leads = [],
  isSuperAdmin = false,
  onNavigateTab,
  onQuickCheckIn,
  onOpenNewMemberModal,
  onOpenNewPaymentModal,
  onOpenScannerModal,
  onSelectMemberDetails,
}: GymOverviewTabProps) {
  // Recherche et autocomplétion
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [checkingIn, setCheckingIn] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Date du jour (Africa/Dakar)
  const todayStr = useMemo(() => {
    try {
      return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Africa/Dakar",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());
    } catch {
      return new Date().toISOString().split("T")[0];
    }
  }, []);

  // Membres correspondants (par nom, téléphone ou numéro SF-0001)
  const filteredMembers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return members.slice(0, 8);
    const digits = q.replace(/\D/g, "");
    return members
      .filter((m) => {
        const numFormatted = formatMemberNumber(m.member_number, m.id).toLowerCase();
        return (
          m.full_name.toLowerCase().includes(q) ||
          numFormatted.includes(q) ||
          (digits.length > 0 && m.phone.replace(/\D/g, "").includes(digits))
        );
      })
      .slice(0, 8);
  }, [members, searchTerm]);

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Vérifier si le membre sélectionné est déjà pointé aujourd'hui
  const todayAttendanceForSelected = useMemo(() => {
    if (!selectedMember) return null;
    return attendances.find(
      (a) => a.member_id === selectedMember.id && a.checked_in_at.startsWith(todayStr)
    );
  }, [selectedMember, attendances, todayStr]);

  const handleSelectMember = (m: Member) => {
    setSelectedMember(m);
    setSearchTerm(m.full_name);
    setIsDropdownOpen(false);
  };

  const handleClearSelection = () => {
    setSelectedMember(null);
    setSearchTerm("");
    inputRef.current?.focus();
  };

  const handleCheckInSubmit = async () => {
    if (!selectedMember || checkingIn) return;
    if (selectedMember.status === "expire" || todayAttendanceForSelected) return;

    setCheckingIn(true);
    try {
      const ok = await onQuickCheckIn(selectedMember.id);
      if (ok !== false) {
        setSelectedMember(null);
        setSearchTerm("");
      }
    } finally {
      setCheckingIn(false);
    }
  };

  // Clavier dans l'autocomplétion
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsDropdownOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % Math.max(1, filteredMembers.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev <= 0 ? filteredMembers.length - 1 : prev - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredMembers[highlightedIndex]) {
        handleSelectMember(filteredMembers[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsDropdownOpen(false);
    }
  };

  // Calcul pour le bloc "À faire"
  const pendingLeads = useMemo(
    () => leads.filter((l) => l.status === "nouveau" || l.status === "contacté"),
    [leads]
  );

  const expiredAndExpiringMembers = useMemo(() => {
    const list = members.filter(
      (m) => m.status === "expire" || m.status === "expire_bientot"
    );
    return list.sort((a, b) => {
      if (a.status === "expire" && b.status !== "expire") return -1;
      if (a.status !== "expire" && b.status === "expire") return 1;
      return a.end_date.localeCompare(b.end_date);
    });
  }, [members]);

  const totalRelances = expiredAndExpiringMembers.length;
  const topRelances = expiredAndExpiringMembers.slice(0, 5);
  const totalTasks = totalRelances + pendingLeads.length;

  const recentAttendances = attendances.slice(0, 5);
  const recentPayments = payments.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* ── 1. COCKPIT D'ACCUEIL : POINTAGE EXPRESS + RACCOURCIS ────────── */}
      <div className="rounded-2xl border border-white/10 bg-[#121212] p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <UserCheck size={16} strokeWidth={2} className="text-lime-400" />
              <span>Poste d&apos;accueil & Pointage express</span>
            </h2>
            <p className="mt-0.5 text-xs text-white/50">
              Scannez la carte membre ou recherchez par nom, téléphone ou N° (ex: SF-0001).
            </p>
          </div>

          {/* Barre de recherche + Bouton Scanner QR */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Champ Autocomplétion */}
            <div className="relative min-w-[240px] sm:w-72" ref={containerRef}>
              <div className="relative flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (selectedMember && e.target.value !== selectedMember.full_name) {
                      setSelectedMember(null);
                    }
                    setIsDropdownOpen(true);
                    setHighlightedIndex(0);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nom, téléphone ou SF-0001..."
                  className="w-full rounded-xl border border-white/15 bg-black/70 px-3.5 py-2.5 pr-8 text-xs text-white placeholder-white/30 focus:border-lime-400 focus:outline-none min-h-[42px]"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="absolute right-2.5 text-xs text-white/40 hover:text-white p-1"
                    title="Effacer"
                    aria-label="Effacer la recherche"
                  >
                    <X size={14} strokeWidth={1.75} />
                  </button>
                )}
              </div>

              {/* Menu déroulant des suggestions */}
              {isDropdownOpen && filteredMembers.length > 0 && (
                <ul
                  role="listbox"
                  className="absolute left-0 right-0 z-50 mt-1 max-h-64 overflow-y-auto rounded-xl border border-white/15 bg-[#181818] p-1.5 shadow-2xl backdrop-blur-xl"
                >
                  {filteredMembers.map((m, idx) => {
                    const isSelected = selectedMember?.id === m.id;
                    const isHighlighted = idx === highlightedIndex;
                    const isExpired = m.status === "expire";
                    const isExpiring = m.status === "expire_bientot";

                    return (
                      <li
                        key={m.id}
                        role="option"
                        aria-selected={isSelected}
                        onMouseDown={() => handleSelectMember(m)}
                        className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-xs transition ${
                          isHighlighted ? "bg-white/10" : "hover:bg-white/5"
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-white truncate">{m.full_name}</p>
                            <span className="font-mono text-[10px] text-lime-400">
                              {formatMemberNumber(m.member_number, m.id)}
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-white/50">{m.phone}</p>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase flex-shrink-0 ${
                            isExpired
                              ? "bg-red-500/20 text-red-400"
                              : isExpiring
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-lime-400/15 text-lime-400"
                          }`}
                        >
                          {isExpired ? "Expiré" : isExpiring ? "Bientôt" : "Actif"}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Boutons d'action : Pointer & Scanner */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void handleCheckInSubmit()}
                disabled={
                  !selectedMember ||
                  checkingIn ||
                  selectedMember.status === "expire" ||
                  Boolean(todayAttendanceForSelected)
                }
                className="flex-1 sm:flex-initial rounded-xl bg-lime-400 px-4 py-2.5 text-xs font-bold text-black transition hover:bg-lime-300 disabled:opacity-40 min-h-[42px]"
              >
                {checkingIn ? "Validation..." : "Pointer l'entrée"}
              </button>

              {onOpenScannerModal && (
                <button
                  type="button"
                  onClick={onOpenScannerModal}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-lime-400/40 bg-lime-400/10 px-3.5 py-2.5 text-xs font-bold text-lime-400 transition hover:bg-lime-400 hover:text-black min-h-[42px]"
                  title="Scanner avec la caméra du téléphone ou la douchette"
                >
                  <ScanLine size={15} />
                  <span>Scanner QR</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Panneau contextuel du membre sélectionné dans le pointage */}
        {selectedMember && (
          <div
            className={`mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-3.5 text-xs animate-in fade-in ${
              selectedMember.status === "expire"
                ? "border-red-500/40 bg-red-500/10 text-red-200"
                : todayAttendanceForSelected
                ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
                : "border-lime-400/30 bg-lime-400/5 text-lime-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle
                size={16}
                className={
                  selectedMember.status === "expire"
                    ? "text-red-400 flex-shrink-0"
                    : todayAttendanceForSelected
                    ? "text-amber-400 flex-shrink-0"
                    : "text-lime-400 flex-shrink-0"
                }
              />
              <div>
                <p className="font-bold text-white">
                  {selectedMember.full_name} ({formatMemberNumber(selectedMember.member_number, selectedMember.id)})
                </p>
                {selectedMember.status === "expire" ? (
                  <p className="text-[11px] text-red-300">
                    Abonnement expiré le {formatAdminDate(selectedMember.end_date)}. Le renouvellement est obligatoire avant d&apos;entrer.
                  </p>
                ) : todayAttendanceForSelected ? (
                  <p className="text-[11px] text-amber-300">
                    Déjà pointé(e) aujourd&apos;hui à{" "}
                    {new Date(todayAttendanceForSelected.checked_in_at).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    .
                  </p>
                ) : (
                  <p className="text-[11px] text-lime-300">
                    Abonnement en règle jusqu&apos;au {formatAdminDate(selectedMember.end_date)}. Cliquez sur « Pointer l&apos;entrée » pour valider.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedMember.status === "expire" && (
                <button
                  type="button"
                  onClick={() => onOpenNewPaymentModal(selectedMember)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-black hover:bg-emerald-400 transition"
                >
                  <CreditCard size={13} />
                  <span>Encaisser le renouvellement</span>
                </button>
              )}
              {onSelectMemberDetails && (
                <button
                  type="button"
                  onClick={() => onSelectMemberDetails(selectedMember)}
                  className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 transition"
                >
                  Voir sa fiche
                </button>
              )}
            </div>
          </div>
        )}

        {/* Barre de raccourcis rapides sur mobile */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-white/40 mr-1">Actions rapides :</span>
          <button
            type="button"
            onClick={onOpenNewMemberModal}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10 transition"
          >
            <UserPlus size={13} className="text-lime-400" />
            <span>Inscrire un membre</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenNewPaymentModal()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10 transition"
          >
            <CreditCard size={13} className="text-emerald-400" />
            <span>Encaisser un paiement</span>
          </button>
          {totalRelances > 0 && (
            <button
              type="button"
              onClick={() => onNavigateTab("relances")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition"
            >
              <span>Relancer les expirés ({totalRelances})</span>
            </button>
          )}
        </div>
      </div>

      {/* ── 2. LIGNE DES CHIFFRES CLÉS UNIFIÉS ──────────────────────────── */}
      <div
        className={`grid grid-cols-2 gap-3 sm:grid-cols-3 ${
          isSuperAdmin ? "xl:grid-cols-6" : "lg:grid-cols-4"
        }`}
      >
        {/* Membres Actifs */}
        <button
          type="button"
          onClick={() => onNavigateTab("members")}
          className="group rounded-xl border border-white/10 bg-[#121212] p-4 text-left transition hover:border-white/20 hover:bg-white/[0.02]"
        >
          <span className="text-xs font-medium text-white/60">Membres actifs</span>
          <p className="mt-2 text-2xl font-bold text-white">{stats.activeMembers}</p>
          <p className="mt-0.5 text-[11px] text-white/40 truncate">
            sur {stats.totalMembers} inscrit(s)
          </p>
        </button>

        {/* Présences Aujourd'hui */}
        <button
          type="button"
          onClick={() => onNavigateTab("attendances")}
          className="group rounded-xl border border-white/10 bg-[#121212] p-4 text-left transition hover:border-white/20 hover:bg-white/[0.02]"
        >
          <span className="text-xs font-medium text-white/60">Présences jour</span>
          <p className="mt-2 text-2xl font-bold text-lime-400">{stats.todayAttendances}</p>
          <p className="mt-0.5 text-[11px] text-white/40 truncate">
            {stats.weekAttendances} cette semaine
          </p>
        </button>

        {/* Relances nécessaires */}
        <button
          type="button"
          onClick={() => onNavigateTab("relances")}
          className="group rounded-xl border border-white/10 bg-[#121212] p-4 text-left transition hover:border-white/20 hover:bg-white/[0.02]"
        >
          <span className="text-xs font-medium text-white/60">À relancer</span>
          <p
            className={`mt-2 text-2xl font-bold ${
              stats.expiringSoonMembers + stats.expiredMembers > 0
                ? "text-amber-400"
                : "text-white"
            }`}
          >
            {stats.expiringSoonMembers + stats.expiredMembers}
          </p>
          <p className="mt-0.5 text-[11px] text-white/50 truncate">
            {stats.expiredMembers} expiré(s) · {stats.expiringSoonMembers} sous 7j
          </p>
        </button>

        {/* Revenus du Mois (FCFA) */}
        <button
          type="button"
          onClick={() => onNavigateTab("finances")}
          className="group rounded-xl border border-white/10 bg-[#121212] p-4 text-left transition hover:border-white/20 hover:bg-white/[0.02]"
        >
          <span className="text-xs font-medium text-white/60">Encaissé ce mois</span>
          <p className="mt-2 text-2xl font-bold text-white">
            {stats.monthRevenueFcfa.toLocaleString("fr-FR")}{" "}
            <span className="text-xs font-medium text-white/50">F</span>
          </p>
          <p className="mt-0.5 text-[11px] text-white/40 truncate">Wave, OM & Espèces</p>
        </button>

        {/* Dépenses du Mois (FCFA) - Super-Admin uniquement */}
        {isSuperAdmin && (
          <button
            type="button"
            onClick={() => onNavigateTab("finances")}
            className="group rounded-xl border border-white/10 bg-[#121212] p-4 text-left transition hover:border-white/20 hover:bg-white/[0.02]"
          >
            <span className="text-xs font-medium text-white/60">Dépenses mois</span>
            <p
              className={`mt-2 text-2xl font-bold ${
                (stats.monthExpensesFcfa || 0) > 0 ? "text-rose-400" : "text-white"
              }`}
            >
              {(stats.monthExpensesFcfa || 0).toLocaleString("fr-FR")}{" "}
              <span className="text-xs font-medium text-white/50">F</span>
            </p>
            <p className="mt-0.5 text-[11px] text-white/40 truncate">Charges du mois</p>
          </button>
        )}

        {/* Solde Net du Mois (FCFA) - Super-Admin uniquement */}
        {isSuperAdmin && (
          <button
            type="button"
            onClick={() => onNavigateTab("finances")}
            className="group rounded-xl border border-white/10 bg-[#121212] p-4 text-left transition hover:border-white/20 hover:bg-white/[0.02]"
          >
            <span className="text-xs font-medium text-white/60">Solde net</span>
            <p
              className={`mt-2 text-2xl font-bold ${
                (stats.monthNetFcfa ?? 0) > 0
                  ? "text-emerald-400"
                  : (stats.monthNetFcfa ?? 0) < 0
                  ? "text-rose-400"
                  : "text-white"
              }`}
            >
              {(stats.monthNetFcfa ?? 0) > 0 ? "+" : ""}
              {(stats.monthNetFcfa ?? 0).toLocaleString("fr-FR")}{" "}
              <span className="text-xs font-medium text-white/50">F</span>
            </p>
            <p className="mt-0.5 text-[11px] text-white/40 truncate">
              {(stats.monthNetFcfa ?? 0) >= 0 ? "Bénéfice ce mois" : "Déficit ce mois"}
            </p>
          </button>
        )}
      </div>

      {/* ── 3. GRILLE OPÉRATIONNELLE : À FAIRE + ACTIVITÉ EN DIRECT ─────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Colonne Gauche (7 cols) : À faire (Relances urgentes + Demandes Web) */}
        <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#121212] p-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Priorités & Relances</h2>
              {totalTasks > 0 && (
                <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
                  {totalTasks}
                </span>
              )}
            </div>
            {totalRelances > 0 && (
              <button
                type="button"
                onClick={() => onNavigateTab("relances")}
                className="text-xs font-medium text-lime-400 hover:underline"
              >
                Voir toutes les relances ({totalRelances}) →
              </button>
            )}
          </div>

          <div className="mt-4 space-y-3">
            {/* Avertissement Demandes Web en attente */}
            {pendingLeads.length > 0 && (
              <div className="flex items-center justify-between rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Clock size={16} strokeWidth={1.75} className="text-cyan-300 flex-shrink-0" />
                  <p className="font-semibold text-white truncate">
                    {pendingLeads.length} prospect{pendingLeads.length > 1 ? "s" : ""} web en attente de suivi
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateTab("leads")}
                  className="rounded-lg bg-cyan-400 px-3 py-1.5 text-xs font-bold text-black transition hover:bg-cyan-300 flex-shrink-0 ml-2"
                >
                  Traiter
                </button>
              </div>
            )}

            {/* Liste des abonnements expirés (max 5 lignes) */}
            {topRelances.length > 0 ? (
              <div className="divide-y divide-white/5">
                {topRelances.map((m) => {
                  const whatsappUrl = buildWhatsAppReminderUrl(m.phone, m.full_name, m.end_date);
                  const isExpired = m.status === "expire";

                  return (
                    <div
                      key={m.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onSelectMemberDetails?.(m)}
                            className="text-xs font-bold text-white hover:text-lime-400 truncate text-left"
                          >
                            {m.full_name}
                          </button>
                          <span
                            className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                              isExpired
                                ? "bg-red-500/20 text-red-400"
                                : "bg-amber-500/20 text-amber-300"
                            }`}
                          >
                            {isExpired ? "Expiré" : "Sous 7j"}
                          </span>
                        </div>
                        <p className="text-[11px] text-white/50">
                          {m.phone} · Échéance : {formatAdminDate(m.end_date)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 self-start sm:self-center">
                        <button
                          type="button"
                          onClick={() => onOpenNewPaymentModal(m)}
                          className="rounded-lg border border-lime-400/30 bg-lime-400/10 px-2.5 py-1.5 text-xs font-semibold text-lime-400 hover:bg-lime-400 hover:text-black transition"
                        >
                          Encaisser
                        </button>
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500 hover:text-black"
                        >
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : pendingLeads.length === 0 ? (
              <div className="py-8 text-center text-xs text-white/50">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg border border-white/5 bg-white/[0.02] text-emerald-400">
                  <CheckCircle2 size={20} strokeWidth={1.75} />
                </div>
                <p className="mt-3 font-semibold text-white">Tout est à jour</p>
                <p className="mt-0.5 text-white/40">
                  Aucun abonnement expiré et aucune demande web en attente.
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Colonne Droite (5 cols) : Activité récente (Derniers passages & encaissements) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Dernières entrées */}
          <div className="rounded-2xl border border-white/10 bg-[#121212] p-4 sm:p-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                <CalendarCheck size={14} className="text-lime-400" />
                <span>Derniers pointages</span>
              </h3>
              <button
                type="button"
                onClick={() => onNavigateTab("attendances")}
                className="text-[11px] font-medium text-lime-400 hover:underline"
              >
                Historique →
              </button>
            </div>
            {recentAttendances.length === 0 ? (
              <p className="py-4 text-center text-xs text-white/40">
                Aucun passage enregistré récemment.
              </p>
            ) : (
              <div className="mt-2.5 divide-y divide-white/5 text-xs">
                {recentAttendances.map((att) => (
                  <div key={att.id} className="flex items-center justify-between py-2">
                    <div className="min-w-0 pr-2">
                      <p className="font-semibold text-white truncate">{att.member_name}</p>
                      <span className="text-[10px] text-white/40 uppercase">
                        {att.method === "qr_code" ? "QR Code" : "Manuel"}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-white/60 flex-shrink-0">
                      {formatAdminDate(att.checked_in_at)} ·{" "}
                      {new Date(att.checked_in_at).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Derniers paiements */}
          <div className="rounded-2xl border border-white/10 bg-[#121212] p-4 sm:p-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                <Receipt size={14} className="text-emerald-400" />
                <span>Derniers encaissements</span>
              </h3>
              <button
                type="button"
                onClick={() => onNavigateTab("finances")}
                className="text-[11px] font-medium text-emerald-400 hover:underline"
              >
                Trésorerie →
              </button>
            </div>
            {recentPayments.length === 0 ? (
              <p className="py-4 text-center text-xs text-white/40">
                Aucun encaissement récent.
              </p>
            ) : (
              <div className="mt-2.5 divide-y divide-white/5 text-xs">
                {recentPayments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2">
                    <div className="min-w-0 pr-2">
                      <p className="font-semibold text-white truncate">{p.member_name}</p>
                      <span className="text-[10px] text-white/40">{p.method}</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-400 flex-shrink-0">
                      +{p.amount_fcfa.toLocaleString("fr-FR")} F
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
