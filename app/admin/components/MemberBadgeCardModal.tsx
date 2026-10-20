"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { Member } from "@/lib/gym-store";
import { logger } from "@/lib/logger";

interface MemberBadgeCardModalProps {
  member: Member | null;
  onClose: () => void;
}

export default function MemberBadgeCardModal({
  member,
  onClose,
}: MemberBadgeCardModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    if (!member) return;

    // QR Payload: clean standardized format recognized by check-in
    const qrPayload = JSON.stringify({
      app: "sambafitness",
      type: "member",
      id: member.id,
      phone: member.phone,
      name: member.full_name,
    });

    QRCode.toDataURL(qrPayload, {
      width: 240,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => logger.error({ err }, "Error generating member QR"));
  }, [member]);

  if (!member) return null;

  const isExpired = member.status === "expire";
  const isExpiring = member.status === "expire_bientot";

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `qrcode-samba-${member.full_name.toLowerCase().replace(/\s+/g, "-")}.png`;
    link.click();
  };

  const cleanPhone = member.phone.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `*SAMBA FITNESS NDIOUM*\n\n` +
      `Bonjour *${member.full_name}* !\n` +
      `Voici votre carte d'accès membre pour vos entraînements.\n\n` +
      `*Abonnement :* ${member.plan_id.toUpperCase()}\n` +
      `*Valable jusqu'au :* ${new Date(member.end_date).toLocaleDateString("fr-FR")}\n` +
      `*Identifiant membre :* ${member.phone}\n\n` +
      `Présentez ce numéro ou votre QR Code à l'accueil pour badger votre présence à chaque séance.\n\n` +
      `Bon entraînement chez SAMBA FITNESS !`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-white/15 bg-[#121212] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-lime-400/20 text-lime-400 font-black text-sm">
              QR
            </span>
            <div>
              <h3 className="text-base font-black uppercase text-white">
                Carte de Membre
              </h3>
              <p className="text-[11px] text-white/50">
                Badging rapide et identification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Printable Physical Badge Card */}
        <div
          id="printable-member-badge"
          className="mt-5 overflow-hidden rounded-2xl border-2 border-lime-400 bg-gradient-to-br from-[#1c1c1c] via-[#111111] to-[#090909] p-6 text-white shadow-xl shadow-lime-400/10"
        >
          {/* Card Top Brand */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <p className="font-sport text-xl tracking-wider text-white">
                SAMBA<span className="text-lime-400">FITNESS</span>
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-lime-400/80">
                Ndioum • Sénégal
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                isExpired
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : isExpiring
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : "bg-lime-400/20 text-lime-400 border border-lime-400/30"
              }`}
            >
              {member.status.replace("_", " ")}
            </span>
          </div>

          {/* Member Info & QR Code */}
          <div className="mt-5 flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2 text-center sm:text-left">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                  Membre
                </p>
                <p className="text-lg font-black text-white">{member.full_name}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                  Téléphone
                </p>
                <p className="font-mono text-xs font-bold text-lime-400">{member.phone}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                  Formule & Validité
                </p>
                <p className="text-xs font-semibold text-white/90 uppercase">{member.plan_id}</p>
                <p className="text-[11px] text-white/60">
                  Jusqu&apos;au {new Date(member.end_date).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>

            {/* Generated QR Code */}
            <div className="flex flex-col items-center">
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrl}
                  alt={`QR code pour ${member.full_name}`}
                  className="h-32 w-32 rounded-xl bg-white p-2 shadow-md"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-xl bg-white/10 text-xs text-white/50">
                  Génération...
                </div>
              )}
              <span className="mt-1 font-mono text-[9px] uppercase tracking-widest text-white/40">
                Scan Check-in
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={handleDownloadQR}
            disabled={!qrDataUrl}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-bold text-white transition hover:bg-white/10"
          >
            <span>Télécharger</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-bold text-white transition hover:bg-white/10"
          >
            <span>Imprimer</span>
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#25D366] py-3 text-xs font-black uppercase tracking-wider text-white transition hover:bg-[#20ba59]"
          >
            <span>Envoyer</span>
          </a>
        </div>
      </div>
    </div>
  );
}
