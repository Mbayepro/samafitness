"use client";

import {
  X,
  Phone,
  MessageSquare,
  QrCode,
  CreditCard,
  UserCheck,
  Edit3,
  Trash2,
  CalendarCheck,
  Receipt,
} from "lucide-react";
import type { Member, Payment, Attendance } from "@/lib/gym-store";
import { formatSenegalPhoneForWhatsApp, buildWhatsAppReminderUrl } from "@/lib/whatsapp";
import { formatAdminDate, formatAdminDateTime, formatMemberNumber } from "./ui/AdminFormatters";

interface MemberDetailsDrawerProps {
  member: Member | null;
  payments: Payment[];
  attendances: Attendance[];
  isSuperAdmin: boolean;
  onClose: () => void;
  onQuickCheckIn: (memberId: string) => Promise<void>;
  onOpenBadge: (member: Member) => void;
  onOpenPayment: (member: Member) => void;
  onEditMember: (member: Member) => void;
  onDeleteMember: (id: string, name: string) => Promise<void>;
}

export default function MemberDetailsDrawer({
  member,
  payments,
  attendances,
  isSuperAdmin,
  onClose,
  onQuickCheckIn,
  onOpenBadge,
  onOpenPayment,
  onEditMember,
  onDeleteMember,
}: MemberDetailsDrawerProps) {
  if (!member) return null;

  const memberPayments = payments.filter((p) => p.member_id === member.id);
  const memberAttendances = attendances.filter((a) => a.member_id === member.id);
  const totalPaidFcfa = memberPayments.reduce((acc, p) => acc + (p.amount_fcfa || 0), 0);

  const whatsappNum = formatSenegalPhoneForWhatsApp(member.phone);
  const whatsappHelloUrl = `https://wa.me/${whatsappNum}?text=${encodeURIComponent(
    `Bonjour ${member.full_name}, c'est l'équipe Samba Fitness Ndioum.`
  )}`;
  const whatsappRemindUrl = buildWhatsAppReminderUrl(
    member.phone,
    member.full_name,
    member.end_date
  );

  const isExpired = member.status === "expire";
  const isExpiring = member.status === "expire_bientot";

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-fade-in">
      {/* Clic extérieur pour fermer */}
      <div className="flex-1" onClick={onClose} />

      <aside className="relative flex h-full w-full max-w-md flex-col border-l border-white/15 bg-[#111113] text-white shadow-2xl overflow-hidden">
        {/* En-tête Fiche Membre */}
        <div className="flex items-start justify-between border-b border-white/10 p-5 bg-[#161618]">
          <div className="min-w-0 pr-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-lime-400 rounded border border-lime-400/30 bg-lime-400/10 px-2 py-0.5">
                {formatMemberNumber(member.member_number, member.id)}
              </span>
              <span
                className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                  isExpired
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : isExpiring
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-lime-400/15 text-lime-400 border border-lime-400/30"
                }`}
              >
                {isExpired ? "Expiré" : isExpiring ? "Expire bientôt" : "Actif"}
              </span>
            </div>
            <h3 className="mt-2 text-lg font-black text-white truncate">{member.full_name}</h3>
            <p className="mt-0.5 font-mono text-xs text-white/60">{member.phone}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la fiche"
            className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Contenu déroulant */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Actions Rapides 1-Clic */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => void onQuickCheckIn(member.id)}
              disabled={isExpired}
              className="flex items-center justify-center gap-2 rounded-xl bg-lime-400 py-2.5 px-3 text-xs font-bold text-black hover:bg-lime-300 transition disabled:opacity-40"
              title={
                isExpired
                  ? "Abonnement expiré : encaissez d'abord le renouvellement"
                  : "Pointer l'entrée aujourd'hui"
              }
            >
              <UserCheck size={15} />
              <span>Pointer l&apos;entrée</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPayment(member);
              }}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 px-3 text-xs font-bold text-black hover:bg-emerald-400 transition"
            >
              <CreditCard size={15} />
              <span>Encaisser / Prolonger</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenBadge(member);
              }}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-2.5 px-3 text-xs font-semibold text-white hover:bg-white/10 transition"
            >
              <QrCode size={15} className="text-lime-400" />
              <span>Carte & QR Code</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onEditMember(member);
              }}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-2.5 px-3 text-xs font-semibold text-white hover:bg-white/10 transition"
            >
              <Edit3 size={15} />
              <span>Modifier la fiche</span>
            </button>
          </div>

          {/* Contact direct */}
          <div className="flex items-center gap-2">
            <a
              href={`tel:${member.phone}`}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] py-2 text-xs font-medium text-white hover:bg-white/10 transition"
            >
              <Phone size={13} />
              <span>Appeler</span>
            </a>
            <a
              href={isExpired || isExpiring ? whatsappRemindUrl : whatsappHelloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500 hover:text-black transition"
            >
              <MessageSquare size={13} />
              <span>{isExpired || isExpiring ? "Relancer WhatsApp" : "WhatsApp"}</span>
            </a>
          </div>

          {/* Résumé Abonnement & Chiffres */}
          <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-white/50">Formule actuelle</span>
              <span className="font-bold uppercase text-white bg-white/10 px-2 py-0.5 rounded">
                {member.plan_id}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/50">Début d&apos;adhésion</span>
              <span className="font-mono text-white/80">{formatAdminDate(member.start_date)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/50">Échéance abonnement</span>
              <span
                className={`font-mono font-bold ${
                  isExpired ? "text-red-400" : isExpiring ? "text-amber-300" : "text-lime-400"
                }`}
              >
                {formatAdminDate(member.end_date)}
              </span>
            </div>
            {member.notes && (
              <div className="pt-2 border-t border-white/10">
                <span className="text-white/40 block mb-1">Notes :</span>
                <p className="text-white/80 italic">{member.notes}</p>
              </div>
            )}
          </div>

          {/* Mini-KPIs du membre */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <span className="text-[11px] text-white/50">Passages enregistrés</span>
              <p className="mt-1 text-lg font-black text-white">{memberAttendances.length}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <span className="text-[11px] text-white/50">Total cumulé payé</span>
              <p className="mt-1 text-lg font-black text-emerald-400">
                {totalPaidFcfa.toLocaleString("fr-FR")}{" "}
                <span className="text-[10px] font-normal text-white/50">F</span>
              </p>
            </div>
          </div>

          {/* Historique des Paiements du membre */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/60 flex items-center gap-1.5 mb-2.5">
              <Receipt size={13} className="text-emerald-400" />
              <span>Historique des paiements ({memberPayments.length})</span>
            </h4>
            {memberPayments.length === 0 ? (
              <p className="rounded-xl border border-white/5 bg-black/30 p-3 text-xs text-white/40 text-center">
                Aucun paiement enregistré pour ce membre.
              </p>
            ) : (
              <div className="space-y-2">
                {memberPayments.slice(0, 8).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs"
                  >
                    <div>
                      <p className="font-mono font-bold text-emerald-400">
                        {p.amount_fcfa.toLocaleString("fr-FR")} FCFA{" "}
                        <span className="ml-1 font-sans text-[10px] font-semibold text-white/60">
                          ({p.method})
                        </span>
                      </p>
                      <p className="text-[11px] text-white/40">
                        Période : {formatAdminDate(p.period_start)} → {formatAdminDate(p.period_end)}
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-white/50">
                      {formatAdminDate(p.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historique des Présences du membre */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/60 flex items-center gap-1.5 mb-2.5">
              <CalendarCheck size={13} className="text-lime-400" />
              <span>Dernières présences ({memberAttendances.length})</span>
            </h4>
            {memberAttendances.length === 0 ? (
              <p className="rounded-xl border border-white/5 bg-black/30 p-3 text-xs text-white/40 text-center">
                Aucun passage enregistré.
              </p>
            ) : (
              <div className="space-y-1.5">
                {memberAttendances.slice(0, 10).map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-black/30 px-3 py-2 text-xs"
                  >
                    <span className="font-mono text-white/80">
                      {formatAdminDateTime(att.checked_in_at)}
                    </span>
                    <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] uppercase text-white/50">
                      {att.method === "qr_code" ? "QR Code" : "Manuel"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pied de tiroir : Suppression (Super Admin) */}
        {isSuperAdmin && (
          <div className="border-t border-white/10 p-4 bg-[#161618] flex items-center justify-between">
            <span className="text-[11px] text-white/40">Zone Super-Admin</span>
            <button
              type="button"
              onClick={() => {
                if (confirm(`Supprimer définitivement le membre ${member.full_name} ?`)) {
                  void onDeleteMember(member.id, member.full_name);
                  onClose();
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500 hover:text-white transition"
            >
              <Trash2 size={13} />
              <span>Supprimer ce membre</span>
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

