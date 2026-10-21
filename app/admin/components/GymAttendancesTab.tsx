"use client";

import { useState, useMemo } from "react";
import { CalendarCheck } from "lucide-react";
import type { Attendance, Member } from "@/lib/gym-store";
import QRScannerModal from "./QRScannerModal";
import { formatAdminDate } from "./ui/AdminFormatters";

interface GymAttendancesTabProps {
  attendances: Attendance[];
  members: Member[];
  onRecordAttendance: (memberId: string) => Promise<void>;
  onOpenPaymentForMember: (member: Member) => void;
  showFeedback: (type: "success" | "error", text: string) => void;
}

export default function GymAttendancesTab({
  attendances,
  members,
  onRecordAttendance,
  onOpenPaymentForMember,
  showFeedback,
}: GymAttendancesTabProps) {
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "all">("today");
  const [submitting, setSubmitting] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const selectedMember = members.find((m) => m.id === selectedMemberId);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) return;

    setSubmitting(true);
    try {
      await onRecordAttendance(selectedMemberId);
      if (selectedMember?.status === "expire") {
        showFeedback(
          "error",
          `Attention : l'abonnement de ${selectedMember.full_name} est expiré !`
        );
      } else {
        showFeedback("success", `Présence de ${selectedMember?.full_name} enregistrée !`);
      }
      setSelectedMemberId("");
    } catch {
      showFeedback("error", "Erreur lors du pointage de la présence.");
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
  const daysOfWeek = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const last7Days = useMemo(() => {
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

      {/* ── MODULE POINTAGE RAPIDE AVEC VÉRIFICATION D'EXPIRATION ── */}
      <div className="rounded-2xl border border-white/10 bg-[#121212] p-4 sm:p-5">
        <h2 className="text-sm font-black uppercase text-white tracking-wide">
          Enregistrer une entrée à la salle
        </h2>
        <p className="mt-0.5 text-xs text-white/50">
          Sélectionnez le membre pour vérifier la validité de son forfait et pointer sa présence.
        </p>

        <form onSubmit={handleCheckIn} className="mt-4 space-y-3">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="flex-1 rounded-xl border border-white/15 bg-black/60 px-3.5 py-2.5 text-xs text-white focus:border-lime-400 focus:outline-none"
            >
              <option value="">-- Choisir un membre adhérent --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name} ({m.phone}) — Fin : {m.end_date}{" "}
                  {m.status === "expire" ? "[EXPIRÉ]" : m.status === "expire_bientot" ? "[EXPIRE BIENTÔT]" : "[ACTIF]"}
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={!selectedMemberId || submitting}
              className="rounded-xl bg-lime-400 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black hover:bg-lime-300 disabled:opacity-40 transition shadow-md shadow-lime-400/20"
            >
              {submitting ? "Pointage..." : "Valider l'entrée"}
            </button>

            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl border border-lime-400/50 bg-lime-400/10 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-lime-400 hover:bg-lime-400 hover:text-black transition"
            >
              <span>Scanner QR</span>
            </button>
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
                      `ABONNEMENT EXPIRÉ depuis le ${formatAdminDate(selectedMember.end_date)} ! Encaissement requis.`}
                  </p>
                </div>
              </div>

              {selectedMember.status !== "actif" && (
                <button
                  type="button"
                  onClick={() => onOpenPaymentForMember(selectedMember)}
                  className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-gray-100 transition"
                >
                  Renouveler maintenant
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

      {/* QR Code Scanner / Camera / Douchette Modal */}
      {isScannerOpen && (
        <QRScannerModal
          onClose={() => setIsScannerOpen(false)}
          showFeedback={showFeedback}
          onOpenPaymentModal={(memberId) => {
            const found = members.find((m) => m.id === memberId);
            if (found) onOpenPaymentForMember(found);
          }}
        />
      )}
    </div>
  );
}
