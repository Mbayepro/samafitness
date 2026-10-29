"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { CalendarCheck, ScanLine, X, CreditCard } from "lucide-react";
import type { Attendance, Member } from "@/lib/gym-store";
import { formatAdminDate, formatMemberNumber } from "./ui/AdminFormatters";

interface GymAttendancesTabProps {
  attendances: Attendance[];
  members: Member[];
  onRecordAttendance: (memberId: string) => Promise<boolean | void>;
  onOpenPaymentForMember: (member: Member) => void;
  onOpenScannerModal?: () => void;
  showFeedback: (type: "success" | "error", text: string) => void;
}

export default function GymAttendancesTab({
  attendances,
  members,
  onRecordAttendance,
  onOpenPaymentForMember,
  onOpenScannerModal,
}: GymAttendancesTabProps) {
  // Autocomplétion de pointage
  const [memberQuery, setMemberQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [searchFilter, setSearchFilter] = useState("");
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "all">("today");

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const matchingMembers = useMemo(() => {
    const q = memberQuery.trim().toLowerCase();
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
  }, [members, memberQuery]);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || submitting || selectedMember.status === "expire") return;

    setSubmitting(true);
    try {
      const ok = await onRecordAttendance(selectedMember.id);
      if (ok !== false) {
        setSelectedMember(null);
        setMemberQuery("");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const [currentDate] = useState(() => new Date());

  // Filtrage des passages
  const { filteredAttendances, todayCount } = useMemo(() => {
    const todayStr = currentDate.toISOString().split("T")[0];
    const sevenDaysAgo = new Date(currentDate.getTime() - 7 * 86400000);

    const filtered = attendances.filter((att) => {
      const matchesSearch =
        (att.member_name || "").toLowerCase().includes(searchFilter.toLowerCase()) ||
        (att.member_phone || "").includes(searchFilter);

      if (!matchesSearch) return false;

      if (dateFilter === "today") {
        return att.checked_in_at.startsWith(todayStr);
      }
      if (dateFilter === "week") {
        return new Date(att.checked_in_at) >= sevenDaysAgo;
      }
      return true;
    });

    const count = attendances.filter((a) => a.checked_in_at.startsWith(todayStr)).length;
    return { filteredAttendances: filtered, todayCount: count };
  }, [attendances, searchFilter, dateFilter, currentDate]);

  // Fréquentation des 7 derniers jours
  const last7Days = useMemo(() => {
    const daysOfWeek = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      const dateStr = d.toISOString().split("T")[0];
      const count = attendances.filter((a) => a.checked_in_at.startsWith(dateStr)).length;
      return {
        dayName: daysOfWeek[d.getDay()],
        dateStr,
        count,
      };
    });
  }, [attendances]);
  const maxDailyAttendance = Math.max(...last7Days.map((d) => d.count), 5);

  return (
    <div className="space-y-6">
      {/* ── GRAPHIQUE FRÉQUENTATION (7 DERNIERS JOURS) ─────────────── */}
      <div className="rounded-2xl border border-white/10 bg-[#121212] p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black uppercase text-white">
              Fréquentation (7 derniers jours)
            </h3>
            <p className="text-xs text-white/50">Nombre de passages enregistrés par jour</p>
          </div>
          <span className="rounded-full bg-lime-400/10 px-3 py-1 text-[11px] font-bold text-lime-400">
            {todayCount} passage(s) aujourd&apos;hui
          </span>
        </div>

        <div className="mt-6 flex h-40 items-end justify-between gap-2 border-b border-white/10 pb-2 sm:gap-4">
          {last7Days.map((d, idx) => {
            const heightPct = Math.max(Math.round((d.count / maxDailyAttendance) * 100), 6);
            const isToday = idx === last7Days.length - 1;
            return (
              <div key={d.dateStr} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[11px] font-bold text-white/60">{d.count}</span>
                <div className="w-full max-w-[36px] rounded-t-lg bg-white/5 overflow-hidden flex items-end h-28">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      isToday ? "bg-lime-400 shadow-lg shadow-lime-400/30" : "bg-white/30 hover:bg-lime-400/70"
                    }`}
                  />
                </div>
                <span
                  className={`text-[11px] font-bold uppercase ${
                    isToday ? "text-lime-400 font-black" : "text-white/40"
                  }`}
                >
                  {d.dayName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── MODULE POINTAGE RAPIDE AVEC RECHERCHE INTELLIGENTE ── */}
      <div className="rounded-2xl border border-white/10 bg-[#121212] p-4 sm:p-5">
        <h2 className="text-sm font-black uppercase text-white tracking-wide">
          Enregistrer une entrée à la salle
        </h2>
        <p className="mt-0.5 text-xs text-white/50">
          Recherchez l&apos;adhérent par nom, téléphone ou numéro de membre (ex: SF-0001), ou scannez son QR code.
        </p>

        <form onSubmit={handleCheckIn} className="mt-4 space-y-3">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <div className="relative flex-1" ref={dropdownRef}>
              <input
                type="text"
                value={memberQuery}
                onChange={(e) => {
                  setMemberQuery(e.target.value);
                  if (selectedMember && e.target.value !== selectedMember.full_name) {
                    setSelectedMember(null);
                  }
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="Tapez un nom, numéro de téléphone ou SF-0001..."
                className="w-full rounded-xl border border-white/15 bg-black/60 px-3.5 py-2.5 pr-8 text-xs text-white placeholder-white/30 focus:border-lime-400 focus:outline-none"
              />
              {memberQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setMemberQuery("");
                    setSelectedMember(null);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1"
                  aria-label="Effacer"
                >
                  <X size={14} />
                </button>
              )}

              {isDropdownOpen && matchingMembers.length > 0 && (
                <ul className="absolute left-0 right-0 z-40 mt-1 max-h-60 overflow-y-auto rounded-xl border border-white/15 bg-[#181818] p-1.5 shadow-2xl">
                  {matchingMembers.map((m) => (
                    <li
                      key={m.id}
                      onMouseDown={() => {
                        setSelectedMember(m);
                        setMemberQuery(m.full_name);
                        setIsDropdownOpen(false);
                      }}
                      className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-xs hover:bg-white/10"
                    >
                      <div>
                        <span className="font-bold text-white">{m.full_name}</span>{" "}
                        <span className="font-mono text-[10px] text-lime-400 ml-1">
                          {formatMemberNumber(m.member_number, m.id)}
                        </span>
                        <span className="block text-[11px] font-mono text-white/50">{m.phone}</span>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${
                          m.status === "expire"
                            ? "bg-red-500/20 text-red-400"
                            : m.status === "expire_bientot"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-lime-400/15 text-lime-400"
                        }`}
                      >
                        {m.status === "expire" ? "Expiré" : m.status === "expire_bientot" ? "Bientôt" : "Actif"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              type="submit"
              disabled={!selectedMember || submitting || selectedMember.status === "expire"}
              className="rounded-xl bg-lime-400 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black hover:bg-lime-300 disabled:opacity-40 transition shadow-md shadow-lime-400/20"
            >
              {submitting ? "Pointage..." : "Valider l'entrée"}
            </button>

            {onOpenScannerModal && (
              <button
                type="button"
                onClick={onOpenScannerModal}
                className="flex items-center justify-center gap-2 rounded-xl border border-lime-400/50 bg-lime-400/10 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-lime-400 hover:bg-lime-400 hover:text-black transition"
              >
                <ScanLine size={15} />
                <span>Scanner QR</span>
              </button>
            )}
          </div>

          {/* ALERTE MEMBRE SÉLECTIONNÉ */}
          {selectedMember && (
            <div
              className={`flex flex-col gap-2.5 rounded-xl border p-3.5 sm:flex-row sm:items-center sm:justify-between ${
                selectedMember.status === "actif"
                  ? "border-lime-400/30 bg-lime-400/5 text-lime-400"
                  : selectedMember.status === "expire_bientot"
                  ? "border-amber-400/30 bg-amber-400/5 text-amber-300"
                  : "border-red-500/40 bg-red-500/10 text-red-400"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-black/30 text-[10px] font-black uppercase">
                  {selectedMember.status === "actif" ? "OK" : selectedMember.status === "expire_bientot" ? "ATTN" : "EXP"}
                </span>
                <div>
                  <p className="text-xs font-bold text-white">{selectedMember.full_name}</p>
                  <p className="text-[11px] opacity-90">
                    {selectedMember.status === "actif" &&
                      `Abonnement en règle jusqu'au ${formatAdminDate(selectedMember.end_date)}.`}
                    {selectedMember.status === "expire_bientot" &&
                      `Attention : l'abonnement expire le ${formatAdminDate(selectedMember.end_date)} (sous 7 jours).`}
                    {selectedMember.status === "expire" &&
                      `ABONNEMENT EXPIRÉ depuis le ${formatAdminDate(selectedMember.end_date)} ! Encaissement requis avant accès.`}
                  </p>
                </div>
              </div>

              {selectedMember.status !== "actif" && (
                <button
                  type="button"
                  onClick={() => onOpenPaymentForMember(selectedMember)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-black hover:bg-emerald-400 transition"
                >
                  <CreditCard size={13} />
                  <span>Renouveler maintenant</span>
                </button>
              )}
            </div>
          )}
        </form>
      </div>

      {/* ── TABLEAU ET FILTRES HISTORIQUE UNIFIÉS ───────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#121212]">
        {/* Barre de filtre intégrée */}
        <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex flex-1 flex-wrap items-center gap-2.5">
            <input
              type="text"
              placeholder="Rechercher par nom..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full sm:w-64 rounded-xl border border-white/10 bg-black/50 px-3.5 py-2 text-xs text-white placeholder-white/30 focus:border-lime-400 focus:outline-none"
            />

            <div className="flex flex-wrap items-center gap-1 rounded-xl border border-white/10 bg-black/50 p-1">
              <button
                type="button"
                onClick={() => setDateFilter("today")}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                  dateFilter === "today" ? "bg-lime-400 text-black" : "text-white/60 hover:text-white"
                }`}
              >
                Aujourd&apos;hui ({todayCount})
              </button>
              <button
                type="button"
                onClick={() => setDateFilter("week")}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                  dateFilter === "week" ? "bg-lime-400 text-black" : "text-white/60 hover:text-white"
                }`}
              >
                7 jours
              </button>
              <button
                type="button"
                onClick={() => setDateFilter("all")}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                  dateFilter === "all" ? "bg-lime-400 text-black" : "text-white/60 hover:text-white"
                }`}
              >
                Tout
              </button>
            </div>
          </div>

          <div className="text-xs text-white/50">
            <span className="font-bold text-white">{filteredAttendances.length}</span> passage(s) listé(s)
          </div>
        </div>

        {/* Contenu du tableau ou état vide */}
        {filteredAttendances.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-[6px] border border-white/5 bg-white/[0.02] text-zinc-400">
              <CalendarCheck size={18} strokeWidth={1.75} />
            </div>
            <h3 className="mt-3 text-sm font-medium text-white">Aucun passage enregistré</h3>
            <p className="mt-1 text-xs text-white/50">
              {dateFilter === "today"
                ? "Aucune entrée enregistrée pour le moment aujourd'hui."
                : "Aucune présence ne correspond aux filtres sélectionnés."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-black/40 text-xs font-semibold text-white/60">
                  <th className="py-3 px-6">Adhérent</th>
                  <th className="py-3 px-4">Date & heure</th>
                  <th className="py-3 px-4">Méthode</th>
                  <th className="py-3 px-4">Enregistré par</th>
                  <th className="py-3 px-6 text-right">Statut abonnement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {filteredAttendances.map((att) => {
                  const checkDate = new Date(att.checked_in_at);
                  const isExpired = att.member_status === "expire";

                  return (
                    <tr key={att.id} className="transition hover:bg-white/[0.02]">
                      <td className="py-4 px-6">
                        <span className="font-bold text-white">{att.member_name}</span>
                        {att.member_phone && (
                          <span className="block text-[11px] font-mono text-white/40">
                            {att.member_phone}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-mono text-white/80">
                          {formatAdminDate(checkDate)} à{" "}
                          <strong className="text-white">
                            {checkDate.toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </strong>
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase text-white/70">
                          {att.method === "qr_code" ? "QR Code" : "Manuel"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-white/60 text-[11px]">
                        {att.recorded_by || "Admin"}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <span
                          className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium ${
                            isExpired
                              ? "bg-red-400/10 text-red-400 border border-red-400/30"
                              : "bg-lime-400/10 text-lime-400 border border-lime-400/30"
                          }`}
                        >
                          {isExpired ? "Expiré" : "Valide"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
