"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import type { GymStats, Member, Attendance } from "@/lib/gym-store";
import type { Lead } from "@/lib/leads-store";
import type { TabKey, FeedbackKind } from "@/app/admin/admin-types";
import { buildWhatsAppReminderUrl } from "@/lib/whatsapp";
import QRScannerModal from "./QRScannerModal";

interface GymOverviewTabProps {
  stats: GymStats;
  members: Member[];
  payments?: unknown[];
  attendances: Attendance[];
  leads?: Lead[];
  onNavigateTab: (tab: TabKey) => void;
  onQuickCheckIn: (memberId: string) => Promise<void>;
  onOpenNewMemberModal: () => void;
  onOpenNewPaymentModal: () => void;
  showFeedback?: (type: FeedbackKind, text: string) => void;
}

export default function GymOverviewTab({
  stats,
  members,
  attendances,
  leads = [],
  onNavigateTab,
  onQuickCheckIn,
  showFeedback,
}: GymOverviewTabProps) {
  // Recherche et autocomplétion
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [checkingIn, setCheckingIn] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Date du jour pour comparaison
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Membres correspondants (limité à 6 ou 8)
  const filteredMembers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return members.slice(0, 8);
    return members
      .filter(
        (m) =>
          m.full_name.toLowerCase().includes(q) ||
          m.phone.replace(/\D/g, "").includes(q.replace(/\D/g, ""))
      )
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
    setDuplicateWarning(null);
  };

  const handleClearSelection = () => {
    setSelectedMember(null);
    setSearchTerm("");
    setDuplicateWarning(null);
    inputRef.current?.focus();
  };

  const handleCheckInSubmit = async (forceDuplicate = false) => {
    if (!selectedMember || checkingIn) return;

    // Détection de doublon si déjà pointé aujourd'hui et non forcé
    if (todayAttendanceForSelected && !forceDuplicate) {
      const timeStr = new Date(todayAttendanceForSelected.checked_in_at).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setDuplicateWarning(
        `${selectedMember.full_name} a déjà été pointé(e) aujourd'hui à ${timeStr}.`
      );
      return;
    }

    setCheckingIn(true);
    setDuplicateWarning(null);
    try {
      await onQuickCheckIn(selectedMember.id);
      if (showFeedback) {
        if (selectedMember.status === "expire") {
          showFeedback("error", `Pointé ! Attention : abonnement de ${selectedMember.full_name} expiré.`);
        } else {
          showFeedback("success", `Entrée validée pour ${selectedMember.full_name} !`);
        }
      }
      setSelectedMember(null);
      setSearchTerm("");
    } catch {
      if (showFeedback) {
        showFeedback("error", "Erreur lors de l'enregistrement de la présence.");
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
    // Trier : expirés d'abord, puis par date d'échéance la plus proche
    return list.sort((a, b) => {
      if (a.status === "expire" && b.status !== "expire") return -1;
      if (a.status !== "expire" && b.status === "expire") return 1;
      return a.end_date.localeCompare(b.end_date);
    });
  }, [members]);

  const totalRelances = expiredAndExpiringMembers.length;
  const topRelances = expiredAndExpiringMembers.slice(0, 5);
  const totalTasks = totalRelances + pendingLeads.length;

  return (
    <div className="space-y-6">
      {/* ── 1. BARRE DE POINTAGE EXPRESS COMPACTE & RESPONSIVE ─────────── */}
      <div className="rounded-2xl border border-lime-400/30 bg-[#121212] p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h2 className="text-sm font-black uppercase text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-lime-400 animate-pulse" />
              <span>Pointage express</span>
            </h2>
            <p className="mt-0.5 text-xs text-white/50 truncate">
              Tapez un nom ou un téléphone pour enregistrer l&apos;entrée immédiatement.
            </p>
          </div>

          {/* Formulaire de recherche et boutons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5">
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
                      setDuplicateWarning(null);
                    }
                    setIsDropdownOpen(true);
                    setHighlightedIndex(0);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nom ou téléphone..."
                  className="w-full rounded-xl border border-white/15 bg-black/70 px-3.5 py-2.5 pr-8 text-xs text-white placeholder-white/30 focus:border-lime-400 focus:outline-none min-h-[42px]"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="absolute right-2.5 text-xs text-white/40 hover:text-white p-1"
                    title="Effacer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Menu déroulant des suggestions (max 8) */}
              {isDropdownOpen && filteredMembers.length > 0 && (
                <ul
                  role="listbox"
                  className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border border-white/15 bg-[#181818] p-1.5 shadow-2xl backdrop-blur-xl"
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
                          <p className="font-bold text-white truncate">{m.full_name}</p>
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
                onClick={() => handleCheckInSubmit(false)}
                disabled={!selectedMember || checkingIn}
                className="flex-1 sm:flex-initial rounded-xl bg-lime-400 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-black transition hover:bg-lime-300 disabled:opacity-40 min-h-[42px] shadow-md shadow-lime-400/20"
              >
                {checkingIn ? "Envoi..." : "Pointer"}
              </button>

              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="flex-1 sm:flex-initial rounded-xl border border-lime-400/50 bg-lime-400/10 px-3.5 py-2.5 text-xs font-black uppercase tracking-wider text-lime-400 transition hover:bg-lime-400 hover:text-black min-h-[42px]"
                title="Scanner QR Code"
              >
                Scanner
              </button>
            </div>
          </div>
        </div>

        {/* Alerte / Confirmation en cas de doublon aujourd'hui */}
        {duplicateWarning && selectedMember && (
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-300 animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <span>{duplicateWarning}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDuplicateWarning(null)}
                className="rounded-lg border border-white/10 px-3 py-1 text-[11px] font-bold text-white/70 hover:bg-white/10"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => handleCheckInSubmit(true)}
                className="rounded-lg bg-amber-400 px-3 py-1 text-[11px] font-black text-black hover:bg-amber-300"
              >
                Confirmer quand même
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── 2. LIGNE DES 4 CHIFFRES CLÉS COMPACTS ───────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Membres Actifs */}
        <button
          type="button"
          onClick={() => onNavigateTab("members")}
          className="group rounded-2xl border border-white/10 bg-[#121212] p-4 text-left transition hover:border-lime-400/40 hover:bg-white/[0.02]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">
              Membres Actifs
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-white">{stats.activeMembers}</p>
          <p className="mt-0.5 text-[11px] text-white/40 truncate">
            {stats.totalMembers} inscrit(s)
          </p>
        </button>

        {/* Présences Aujourd'hui */}
        <button
          type="button"
          onClick={() => onNavigateTab("attendances")}
          className="group rounded-2xl border border-white/10 bg-[#121212] p-4 text-left transition hover:border-cyan-400/40 hover:bg-white/[0.02]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">
              Présences Jour
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-cyan-400">{stats.todayAttendances}</p>
          <p className="mt-0.5 text-[11px] text-white/40 truncate">
            {stats.weekAttendances} cette semaine
          </p>
        </button>

        {/* Revenus du Mois (FCFA) */}
        <button
          type="button"
          onClick={() => onNavigateTab("finances")}
          className="group rounded-2xl border border-white/10 bg-[#121212] p-4 text-left transition hover:border-emerald-400/40 hover:bg-white/[0.02]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">
              Encaissé Mois
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-400">
            {stats.monthRevenueFcfa.toLocaleString("fr-FR")}{" "}
            <span className="text-xs font-bold text-white/40">F</span>
          </p>
          <p className="mt-0.5 text-[11px] text-white/40 truncate">Wave, OM & Cash</p>
        </button>

        {/* Relances nécessaires */}
        <button
          type="button"
          onClick={() => onNavigateTab("members")}
          className="group rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-left transition hover:border-amber-400/40 hover:bg-amber-500/10"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Relances
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-amber-400">
            {stats.expiringSoonMembers + stats.expiredMembers}
          </p>
          <p className="mt-0.5 text-[11px] text-white/50 truncate">
            {stats.expiredMembers} expiré(s) · {stats.expiringSoonMembers} sous 7j
          </p>
        </button>
      </div>

      {/* ── 3. SEUL BLOC "À FAIRE" (RELANCES + DEMANDES WEB) ─────────────── */}
      <div className="rounded-2xl border border-white/10 bg-[#121212] p-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black uppercase text-white">À faire</h2>
            {totalTasks > 0 && (
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-black text-amber-300">
                {totalTasks}
              </span>
            )}
          </div>
          {totalRelances > 5 && (
            <button
              type="button"
              onClick={() => onNavigateTab("members")}
              className="text-xs font-bold text-lime-400 hover:underline"
            >
              Voir les {totalRelances} relances →
            </button>
          )}
        </div>

        <div className="mt-4 space-y-3">
          {/* Avertissement Demandes Web en attente */}
          {pendingLeads.length > 0 && (
            <div className="flex items-center justify-between rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-base flex-shrink-0">📬</span>
                <p className="font-bold text-cyan-200 truncate">
                  {pendingLeads.length} demande{pendingLeads.length > 1 ? "s" : ""} web en attente
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab("members")}
                className="rounded-lg bg-cyan-400 px-3 py-1 text-[11px] font-black text-black transition hover:bg-cyan-300 flex-shrink-0 ml-2"
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
                        <p className="text-xs font-bold text-white truncate">{m.full_name}</p>
                        <span
                          className={`rounded-full px-1.5 py-0.2 text-[9px] font-black uppercase ${
                            isExpired
                              ? "bg-red-500/20 text-red-400"
                              : "bg-amber-500/20 text-amber-300"
                          }`}
                        >
                          {isExpired ? "Expiré" : "Bientôt"}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/50">
                        {m.phone} · Échéance : {m.end_date}
                      </p>
                    </div>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 transition hover:bg-emerald-500 hover:text-black self-start sm:self-center"
                    >
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z" />
                      </svg>
                      <span>Relancer WhatsApp</span>
                    </a>
                  </div>
                );
              })}
            </div>
          ) : pendingLeads.length === 0 ? (
            <div className="py-8 text-center text-xs text-white/50">
              <span className="text-2xl">✨</span>
              <p className="mt-2 font-bold text-white">Tout est à jour !</p>
              <p className="mt-0.5 text-white/40">
                Aucun abonnement expiré et aucune demande web en attente.
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Lecteur QR Modal si clic sur Scanner */}
      {isScannerOpen && (
        <QRScannerModal
          members={members}
          onCheckInMember={onQuickCheckIn}
          onClose={() => setIsScannerOpen(false)}
          showFeedback={showFeedback || (() => {})}
        />
      )}
    </div>
  );
}
