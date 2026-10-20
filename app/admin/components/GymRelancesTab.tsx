"use client";

import { useState } from "react";
import type { Member } from "@/lib/gym-store";
import { formatSenegalPhoneForWhatsApp } from "@/lib/whatsapp";

interface GymRelancesTabProps {
  members: Member[];
  onOpenPaymentForMember: (member: Member) => void;
}

export default function GymRelancesTab({
  members,
  onOpenPaymentForMember,
}: GymRelancesTabProps) {
  const [filterType, setFilterType] = useState<"all" | "soon" | "expired">("all");
  const [search, setSearch] = useState("");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filtrer les membres nécessitant une relance
  const needingFollowUp = members.filter((m) => m.status === "expire" || m.status === "expire_bientot");

  const filtered = needingFollowUp.filter((m) => {
    if (filterType === "soon" && m.status !== "expire_bientot") return false;
    if (filterType === "expired" && m.status !== "expire") return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        m.full_name.toLowerCase().includes(q) ||
        m.phone.includes(q) ||
        (m.notes && m.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* ── EN-TÊTE DE SECTION ───────────────────────────────────────── */}
      <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/30 via-[#121212] to-black p-4 sm:p-5">
        <div>
          <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-400">
            Module Relances Adhérents
          </span>
          <h2 className="mt-1.5 text-base sm:text-lg font-black uppercase text-white">
            Renouvellements & Abonnements à relancer
          </h2>
          <p className="mt-1 text-xs text-white/60">
            Contactez vos membres en un clic via WhatsApp avec un message personnalisé pour renouveler leur abonnement.
          </p>
        </div>

        {/* Filtres rapides */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <input
            type="text"
            placeholder="Rechercher par nom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-60 rounded-xl border border-white/10 bg-black/50 px-3.5 py-2 text-xs text-white placeholder-white/30 focus:border-amber-400 focus:outline-none"
          />

          <div className="flex flex-wrap items-center gap-1 rounded-xl border border-white/10 bg-black/50 p-1">
            <button
              onClick={() => setFilterType("all")}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                filterType === "all" ? "bg-amber-400 text-black" : "text-white/60 hover:text-white"
              }`}
            >
              Tous ({needingFollowUp.length})
            </button>
            <button
              onClick={() => setFilterType("soon")}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                filterType === "soon" ? "bg-amber-400 text-black" : "text-white/60 hover:text-white"
              }`}
            >
              Sous 7j ({needingFollowUp.filter((m) => m.status === "expire_bientot").length})
            </button>
            <button
              onClick={() => setFilterType("expired")}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                filterType === "expired" ? "bg-amber-400 text-black" : "text-white/60 hover:text-white"
              }`}
            >
              Expirés ({needingFollowUp.filter((m) => m.status === "expire").length})
            </button>
          </div>
        </div>
      </div>

      {/* ── LISTE DES MEMBRES À RELANCER ────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#121212] p-10 text-center">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-xs font-black text-white/40">
            OK
          </span>
          <h3 className="mt-2 text-sm font-bold text-white">Aucun membre à relancer !</h3>
          <p className="mt-1 text-xs text-white/50">
            Tous les adhérents de Samba Fitness Ndioum sont actuellement en règle avec un abonnement actif.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
          {filtered.map((member) => {
            const whatsappNumber = formatSenegalPhoneForWhatsApp(member.phone);

            const [y, m, d] = member.end_date.split("-").map(Number);
            const endDate = new Date(y, (m || 1) - 1, d || 1);
            const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            const isExpired = member.status === "expire";

            // Messages personnalisés
            const msgFR = encodeURIComponent(
              `Bonjour ${member.full_name}, c'est Samba Diop de Samba Fitness Ndioum. ` +
                (isExpired
                  ? `Votre abonnement est arrivé à échéance le ${member.end_date}. Souhaitez-vous le renouveler (par Wave ou directement au club) pour continuer vos entraînements ?`
                  : `Votre abonnement arrive à échéance dans ${diffDays} jour(s) (le ${member.end_date}). Souhaitez-vous le renouveler pour garder votre accès sans interruption ?`)
            );

            const msgWolof = encodeURIComponent(
              `Salam ${member.full_name}, Samba Diop la Samba Fitness Ndioum. ` +
                (isExpired
                  ? `Sa abonnement dafa jeex ci bés bi ${member.end_date}. Ndax danga bëgg ñu yéssal ko (ci Wave walla ci club bi) ngir nga mëna wéy di entraîné ?`
                  : `Sa abonnement dafay jeex ci ${diffDays} fan (bés bi ${member.end_date}). Ndax danga bëgg ñu yéssal ko ngir baña dagg ?`)
            );

            return (
              <div
                key={member.id}
                className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#121212] p-4 sm:p-5 transition hover:border-amber-400/30"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-black text-white">{member.full_name}</h4>
                      <p className="mt-0.5 font-mono text-xs text-white/50">{member.phone}</p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                        isExpired
                          ? "bg-red-400/10 text-red-400 border border-red-400/30"
                          : "bg-amber-400/10 text-amber-400 border border-amber-400/30"
                      }`}
                    >
                      {isExpired ? `Expiré (${Math.abs(diffDays)}j)` : `Expire dans ${diffDays}j`}
                    </span>
                  </div>

                  <div className="mt-4 space-y-1.5 rounded-2xl border border-white/5 bg-black/40 p-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-white/40">Formule :</span>
                      <span className="font-bold text-white uppercase">{member.plan_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Échéance :</span>
                      <span className="font-mono font-bold text-white">{member.end_date}</span>
                    </div>
                    {member.notes && (
                      <p className="mt-1 text-[11px] text-white/40 italic">Note : {member.notes}</p>
                    )}
                  </div>
                </div>

                {/* Actions relances */}
                <div className="mt-6 flex flex-col gap-2 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://wa.me/${whatsappNumber}?text=${msgFR}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 py-2.5 text-center text-xs font-bold text-emerald-400 hover:bg-emerald-500 hover:text-black transition"
                    >
                      Relance (FR)
                    </a>
                    <a
                      href={`https://wa.me/${whatsappNumber}?text=${msgWolof}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 py-2.5 text-center text-xs font-bold text-emerald-400 hover:bg-emerald-500 hover:text-black transition"
                    >
                      Relance (Wolof)
                    </a>
                  </div>

                  <button
                    onClick={() => onOpenPaymentForMember(member)}
                    className="w-full rounded-xl bg-lime-400 py-2.5 text-center text-xs font-black uppercase tracking-wider text-black hover:bg-lime-300 transition shadow-md shadow-lime-400/10"
                  >
                    Encaisser le renouvellement
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
