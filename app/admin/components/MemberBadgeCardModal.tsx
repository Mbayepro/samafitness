"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import QRCode from "qrcode";
import { X, RefreshCw, Printer, Share2, MessageSquare, Download, AlertTriangle, CheckCircle2, Copy } from "lucide-react";
import type { Member } from "@/lib/gym-store";
import { formatSenegalPhoneForWhatsApp } from "@/lib/whatsapp";
import { logger } from "@/lib/logger";
import { formatAdminDate, formatMemberNumber } from "./ui/AdminFormatters";
import { regenerateMemberQrTokenAction } from "@/app/actions/gym-actions";

interface MemberBadgeCardModalProps {
  member: Member | null;
  onClose: () => void;
  onMemberUpdated?: (updated: Member) => void;
}

// Résolution 2x ultra haute définition (ratio strict 85.6 x 54 mm = 1.585)
const CARD_WIDTH = 2024;
const CARD_HEIGHT = 1276;

/** Formate "Membre depuis MM/AAAA" */
function formatMemberSince(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const trimmed = dateStr.trim();
    const match = trimmed.match(/^(\d{4})-(\d{2})/);
    if (match) {
      return `${match[2]}/${match[1]}`;
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${month}/${year}`;
    }
  } catch {
    // Ignorer
  }
  return "";
}

/** Ajuste dynamiquement la taille du texte ou tronque pour éviter tout débordement */
function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  initialSize: number,
  minSize: number
): { size: number; text: string } {
  let size = initialSize;
  while (size >= minSize) {
    ctx.font = `bold ${size}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) {
      return { size, text };
    }
    size -= 2;
  }
  // Si encore trop grand à la taille minimale, tronquer avec ellipse
  ctx.font = `bold ${minSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  let truncated = text;
  while (truncated.length > 2 && ctx.measureText(truncated + "…").width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return { size: minSize, text: truncated + "…" };
}

export default function MemberBadgeCardModal({
  member: initialMember,
  onClose,
  onMemberUpdated,
}: MemberBadgeCardModalProps) {
  const [member, setMember] = useState<Member | null>(initialMember);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  
  // Fichier PNG et URL pré-générés à l'avance pour navigator.share synchrone
  const [preparedFile, setPreparedFile] = useState<File | null>(null);
  const [preparedDataUrl, setPreparedDataUrl] = useState<string>("");
  const [isPreparing, setIsPreparing] = useState(true);

  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "info" | "error"; text: string } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setMember(initialMember);
  }, [initialMember]);

  // 1. Génération du QR Code HD (noir sur fond blanc, marge >= 4 modules)
  useEffect(() => {
    if (!member) return;

    // Le QR code contient EXCLUSIVEMENT le jeton opaque sécurisé
    const token = member.qr_token || member.id;

    QRCode.toDataURL(token, {
      width: 700,
      margin: 4, // 4 modules de marge blanche stricts
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
      errorCorrectionLevel: "H",
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => logger.error({ err }, "Erreur génération QR Code membre"));
  }, [member]);

  // 2. Rendu de la carte HD (2024 x 1276 px) sur canvas
  const renderCardToCanvas = useCallback(async (): Promise<{ dataUrl: string; blob: Blob } | null> => {
    if (!member || !qrDataUrl) return null;

    try {
      if (typeof document !== "undefined" && document.fonts) {
        await document.fonts.ready;
      }
    } catch {
      // Ignorer si l'API des polices n'est pas disponible
    }

    const canvas = canvasRef.current || document.createElement("canvas");
    canvas.width = CARD_WIDTH;
    canvas.height = CARD_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Fond sombre épuré avec halo athlétique
    const bgGrad = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
    bgGrad.addColorStop(0, "#141619");
    bgGrad.addColorStop(0.55, "#0d0e11");
    bgGrad.addColorStop(1, "#070809");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    // Motif géométrique athlétique subtil en filigrane (bandes obliques)
    ctx.save();
    ctx.strokeStyle = "rgba(163, 230, 53, 0.035)";
    ctx.lineWidth = 28;
    for (let x = -400; x < CARD_WIDTH + 600; x += 110) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x - 450, CARD_HEIGHT);
      ctx.stroke();
    }
    ctx.restore();

    // Bordure extérieure sobre
    ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, CARD_WIDTH - 6, CARD_HEIGHT - 6);

    // Liseré supérieur sport lime + ambre
    const topBarGrad = ctx.createLinearGradient(0, 0, CARD_WIDTH, 0);
    topBarGrad.addColorStop(0, "#a3e635");
    topBarGrad.addColorStop(0.7, "#84cc16");
    topBarGrad.addColorStop(1, "#f59e0b");
    ctx.fillStyle = topBarGrad;
    ctx.fillRect(0, 0, CARD_WIDTH, 16);

    // ── EN-TÊTE : MARQUE SAMBA FITNESS & NUMÉRO ───────────────────────
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 68px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText("SAMBA", 100, 130);

    const sambaWidth = ctx.measureText("SAMBA ").width;
    ctx.fillStyle = "#a3e635";
    ctx.fillText("FITNESS", 100 + sambaWidth, 130);

    ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
    ctx.font = "600 26px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.letterSpacing = "4px";
    ctx.fillText("NDIOUM • SÉNÉGAL", 100, 180);

    // Badge Numéro de membre court (ex: SF-0001)
    const memberNumText = formatMemberNumber(member.member_number, member.id);
    const numBoxWidth = 340;
    const numBoxHeight = 90;
    const numX = CARD_WIDTH - 100 - numBoxWidth;
    const numY = 70;

    ctx.fillStyle = "rgba(163, 230, 53, 0.12)";
    ctx.strokeStyle = "rgba(163, 230, 53, 0.4)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(numX, numY, numBoxWidth, numBoxHeight, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#a3e635";
    ctx.font = "bold 44px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.fillText(memberNumText, numX + numBoxWidth / 2, numY + 60);
    ctx.textAlign = "left";

    // Ligne séparatrice sous l'en-tête
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, 230);
    ctx.lineTo(CARD_WIDTH - 100, 230);
    ctx.stroke();

    // ── SECTION CENTRALE : NOM DU MEMBRE & DATE D'ADHÉSION ────────────
    const qrContainerSize = 680;
    const qrContainerX = CARD_WIDTH - 100 - qrContainerSize;
    const qrContainerY = 280;
    const leftColMaxWidth = qrContainerX - 100 - 80; // Espace disponible pour le texte à gauche

    ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
    ctx.font = "bold 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText("CARTE DE MEMBRE PERMANENTE", 100, 340);

    // Nom du membre ajusté dynamiquement pour ne JAMAIS chevaucher
    const fitted = fitText(ctx, member.full_name, leftColMaxWidth, 72, 40);
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${fitted.size}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    ctx.fillText(fitted.text, 100, 440);

    // "Membre depuis MM/AAAA"
    const memberSince = formatMemberSince(member.created_at || member.start_date);
    if (memberSince) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
      ctx.font = "600 28px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText(`Membre depuis ${memberSince}`, 100, 520);
    }

    ctx.fillStyle = "rgba(163, 230, 53, 0.8)";
    ctx.font = "500 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText("Validité de l'accès vérifiée en temps réel au scan", 100, 600);

    // ── SECTION DROITE : QR CODE SÉCURISÉ (Contraste maximal) ───────────
    const qrImage = new Image();
    qrImage.src = qrDataUrl;
    await new Promise((resolve) => {
      if (qrImage.complete) resolve(null);
      else qrImage.onload = () => resolve(null);
    });

    // Boîte blanche nette avec marge
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(qrContainerX, qrContainerY, qrContainerSize, qrContainerSize, 24);
    ctx.fill();

    const qrPadding = 30;
    ctx.drawImage(
      qrImage,
      qrContainerX + qrPadding,
      qrContainerY + qrPadding,
      qrContainerSize - qrPadding * 2,
      qrContainerSize - qrPadding * 2
    );

    // Libellé sous QR
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "bold 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SCANNER À L'ACCUEIL", qrContainerX + qrContainerSize / 2, qrContainerY + qrContainerSize + 55);
    ctx.textAlign = "left";

    // ── PIED DE CARTE SÉPARÉ : DEUX ZONES DISTINCTES SANS CHEVAUCHEMENT ─
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, 1140);
    ctx.lineTo(CARD_WIDTH - 100, 1140);
    ctx.stroke();

    // Zone gauche : Adresse de la salle
    ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
    ctx.font = "26px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "left";
    const addressText = "Samba Fitness • En face de la Mairie, Ndioum";
    ctx.fillText(addressText, 100, 1205);

    // Zone droite : Téléphone officiel
    ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
    ctx.font = "600 26px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "right";
    const phoneText = "Tél: +221 78 957 35 53";
    ctx.fillText(phoneText, CARD_WIDTH - 100, 1205);
    ctx.textAlign = "left";

    const dataUrl = canvas.toDataURL("image/png");
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
    if (!blob) return null;

    return { dataUrl, blob };
  }, [member, qrDataUrl]);

  // 3. Préparation automatique de l'image dès l'ouverture de la modale
  useEffect(() => {
    let isCancelled = false;

    if (!member || !qrDataUrl) {
      setIsPreparing(true);
      return;
    }

    setIsPreparing(true);
    renderCardToCanvas().then((res) => {
      if (isCancelled || !res) return;
      const fileName = `carte-samba-${member.full_name.toLowerCase().replace(/[^a-z0-9]/g, "-")}.png`;
      const file = new File([res.blob], fileName, { type: "image/png" });
      setPreparedFile(file);
      setPreparedDataUrl(res.dataUrl);
      setIsPreparing(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [member, qrDataUrl, renderCardToCanvas]);

  if (!member) return null;

  const memberNumFormatted = formatMemberNumber(member.member_number, member.id);
  const memberSince = formatMemberSince(member.created_at || member.start_date);

  // Téléchargement de secours
  const triggerDownload = (msg = "Image téléchargée. Joignez-la dans WhatsApp.") => {
    if (!preparedDataUrl && !preparedFile) return;
    try {
      const url = preparedDataUrl || (preparedFile ? URL.createObjectURL(preparedFile) : "");
      const fileName = `carte-samba-${member.full_name.toLowerCase().replace(/[^a-z0-9]/g, "-")}.png`;
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setFeedback({ type: "info", text: msg });
      setTimeout(() => setFeedback(null), 6000);
    } catch (err) {
      console.error("Erreur lors du téléchargement de la carte :", err);
      setFeedback({ type: "error", text: "Erreur lors du téléchargement de l'image." });
    }
  };

  // Gestionnaire de clic immédiat pour navigator.share (AUCUN await avant l'appel !)
  const handleShareCard = () => {
    if (!preparedFile) {
      setFeedback({ type: "info", text: "Génération de la carte en cours, veuillez patienter…" });
      return;
    }

    // 1. Si navigator.share et canShare supportent les fichiers (smartphone moderne en HTTPS)
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function" &&
      typeof navigator.canShare === "function" &&
      navigator.canShare({ files: [preparedFile] })
    ) {
      navigator
        .share({
          files: [preparedFile],
          title: `Carte de membre - ${member.full_name}`,
          text: `Voici votre carte d'accès permanente Samba Fitness Ndioum (${memberNumFormatted}).`,
        })
        .then(() => {
          setFeedback({ type: "success", text: "Carte envoyée avec succès !" });
          setTimeout(() => setFeedback(null), 4000);
        })
        .catch((err: unknown) => {
          const error = err as Error;
          // Si l'utilisateur clique sur "Annuler" dans la feuille de partage, ignorer silencieusement
          if (error?.name === "AbortError") {
            return;
          }
          console.error("Erreur navigator.share :", err);
          // Toute autre erreur bascule sur le téléchargement assisté
          triggerDownload("Partage direct indisponible. Image téléchargée, joignez-la dans WhatsApp.");
        });
      return;
    }

    // 2. Si le partage de fichier n'est pas supporté (ex: desktop Chrome/Firefox)
    triggerDownload("Image téléchargée. Joignez-la dans WhatsApp.");
  };

  // Action : Message WhatsApp texte seul avec format 221
  const cleanPhone = formatSenegalPhoneForWhatsApp(member.phone);
  const whatsappTextUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `*SAMBA FITNESS NDIOUM*\n\n` +
      `Bonjour *${member.full_name}* !\n` +
      `Voici votre carte d'accès permanente au club :\n\n` +
      `*Numéro de membre :* ${memberNumFormatted}\n` +
      (memberSince ? `*Adhérent depuis :* ${memberSince}\n\n` : `\n`) +
      `Présentez votre QR code ou votre numéro de membre à l'accueil pour badger votre présence à chaque séance.\n\n` +
      `Bon entraînement chez SAMBA FITNESS !`
  )}`;

  // Action : Régénérer le QR Code (invalidation de l'ancien)
  const handleConfirmRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const res = await regenerateMemberQrTokenAction(member.id);
      if (res.success && res.member) {
        setMember(res.member);
        onMemberUpdated?.(res.member);
        setShowRegenConfirm(false);
        setFeedback({
          type: "success",
          text: "Nouveau QR Code généré. L'ancien QR code est désormais invalide.",
        });
        setTimeout(() => setFeedback(null), 5000);
      }
    } catch (err) {
      console.error("Erreur lors de la régénération du QR :", err);
      setFeedback({ type: "error", text: "Échec de la régénération du QR Code." });
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-member-badge,
          #printable-member-badge * {
            visibility: visible !important;
          }
          #printable-member-badge {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 85.6mm !important;
            height: 54mm !important;
            max-width: 85.6mm !important;
            max-height: 54mm !important;
            margin: 0 !important;
            padding: 4mm !important;
            border-radius: 3mm !important;
            border: 0.5mm solid #000000 !important;
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-shadow: none !important;
          }
          #printable-member-badge * {
            color: #000000 !important;
          }
          @page {
            size: 85.6mm 54mm;
            margin: 0;
          }
        }
      `}</style>

      {/* Canvas invisible haute définition (2024 x 1276 px) */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-xl border border-white/15 bg-[#121214] p-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-lime-400/15 text-lime-400 font-mono text-xs font-bold">
              ID
            </span>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Carte permanente Membre</span>
                <span className="font-mono text-xs text-lime-400">{memberNumFormatted}</span>
              </h3>
              <p className="text-[11px] text-white/50">
                Format carte bancaire (85,6 × 54 mm) • Jeton opaque sécurisé
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-7 w-7 items-center justify-center rounded-md text-white/50 hover:bg-white/10 hover:text-white transition"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </div>

        {/* Retours visibles (Succès, Téléchargement, Erreur) */}
        {feedback && (
          <div
            className={`mt-3 flex items-center gap-2 rounded-md px-3 py-2 text-xs animate-fade-in ${
              feedback.type === "success"
                ? "border border-lime-400/30 bg-lime-400/10 text-lime-300"
                : feedback.type === "error"
                ? "border border-red-500/30 bg-red-500/10 text-red-300"
                : "border border-white/20 bg-white/10 text-white"
            }`}
          >
            <CheckCircle2 size={14} className="flex-shrink-0" />
            <span>{feedback.text}</span>
          </div>
        )}

        {/* ── APERÇU DE LA CARTE PERMANENTE (Ratio 85.6 x 54 mm) ───────────── */}
        <div
          id="printable-member-badge"
          className="mt-4 relative overflow-hidden rounded-xl border border-white/15 bg-gradient-to-br from-[#18181b] to-[#0c0c0e] p-4 text-white shadow-lg flex flex-col justify-between"
          style={{ aspectRatio: "85.6 / 54" }}
        >
          {/* Liseré supérieur sport */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-lime-400 via-lime-500 to-amber-400" />

          {/* En-tête */}
          <div className="flex items-start justify-between border-b border-white/10 pb-2">
            <div>
              <p className="text-sm font-black tracking-wide text-white">
                SAMBA<span className="text-lime-400">FITNESS</span>
              </p>
              <p className="text-[9px] font-semibold tracking-wider text-white/40">
                NDIOUM • SÉNÉGAL
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (typeof navigator !== "undefined" && navigator.clipboard) {
                  navigator.clipboard.writeText(memberNumFormatted);
                  setFeedback({
                    type: "success",
                    text: `Numéro ${memberNumFormatted} copié dans le presse-papiers !`,
                  });
                  setTimeout(() => setFeedback(null), 3000);
                }
              }}
              title="Cliquer pour copier le numéro de membre"
              className="inline-flex items-center gap-1 font-mono text-xs font-bold text-lime-400 rounded border border-lime-400/30 bg-lime-400/10 px-2 py-0.5 hover:bg-lime-400/20 transition"
            >
              <span>{memberNumFormatted}</span>
              <Copy size={10} />
            </button>
          </div>

          {/* Corps de carte : Nom et QR (pas de statut, pas de tél, pas de formule) */}
          <div className="flex items-center justify-between gap-3 my-auto">
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-[9px] font-semibold text-white/40 uppercase tracking-wider">
                Adhérent
              </p>
              <h4 className="text-base font-bold text-white truncate" title={member.full_name}>
                {member.full_name}
              </h4>
              {memberSince && (
                <p className="text-[10px] text-white/60 font-medium">
                  Membre depuis {memberSince}
                </p>
              )}
            </div>

            {/* QR Code permanent */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="rounded-lg bg-white p-1 shadow-md">
                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrDataUrl}
                    alt={`QR code d'accès permanent pour ${member.full_name}`}
                    className="h-20 w-20 object-contain"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center text-[10px] text-black/50">
                    Chargement...
                  </div>
                )}
              </div>
              <span className="mt-0.5 font-mono text-[7px] font-medium text-white/40">
                Scan Check-in
              </span>
            </div>
          </div>

          {/* Pied de carte : Deux zones distinctes sans aucun chevauchement */}
          <div className="border-t border-white/10 pt-1.5 flex items-center justify-between text-[8px] text-white/40">
            <span className="truncate max-w-[60%]">Samba Fitness • En face de la Mairie, Ndioum</span>
            <span className="font-medium text-white/60 flex-shrink-0">Tél: +221 78 957 35 53</span>
          </div>
        </div>

        {/* ── MODALE CONFIRMATION RÉGÉNÉRATION QR ─────────────────────────── */}
        {showRegenConfirm ? (
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 animate-fade-in">
            <div className="flex items-start gap-2.5">
              <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <p className="font-bold text-amber-200">
                  Régénérer le jeton QR de {member.full_name} ?
                </p>
                <p className="text-amber-300/80">
                  Cette action invalide immédiatement l&apos;ancien QR Code. Le membre devra utiliser la nouvelle carte.
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRegenConfirm(false)}
                disabled={isRegenerating}
                className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmRegenerate}
                disabled={isRegenerating}
                className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-bold text-black hover:bg-amber-400"
              >
                {isRegenerating ? "Régénération..." : "Confirmer le remplacement"}
              </button>
            </div>
          </div>
        ) : null}

        {/* ── ACTIONS : ENVOI, WHATSAPP, IMPRESSION, IMAGE HD, RÉGÉNÉRATION ─ */}
        <div className="mt-4 space-y-2">
          {/* Boutons principaux */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              id="btn-share-member-card"
              type="button"
              onClick={handleShareCard}
              disabled={isPreparing}
              className="flex items-center justify-center gap-2 rounded-md bg-lime-400 px-3.5 py-2.5 text-xs font-bold text-black hover:bg-lime-300 transition disabled:opacity-50"
              title="Partage la carte PNG via le smartphone (navigator.share) ou la télécharge sur PC"
            >
              <Share2 size={14} strokeWidth={2} />
              <span>{isPreparing ? "Préparation…" : "Envoyer la carte"}</span>
            </button>

            <a
              href={whatsappTextUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/15 px-3.5 py-2.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25 transition"
              title="Ouvre WhatsApp avec le message récapitulatif textuel"
            >
              <MessageSquare size={14} strokeWidth={2} />
              <span>Message WhatsApp (texte seul)</span>
            </a>
          </div>

          {/* Outils secondaires */}
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/5">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center justify-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-2 text-xs font-medium text-white hover:bg-white/10 transition"
              title="Imprime la carte seule au format 85.6 x 54 mm"
            >
              <Printer size={13} />
              <span>Imprimer</span>
            </button>

            <button
              type="button"
              onClick={() => triggerDownload("Image haute définition téléchargée.")}
              disabled={isPreparing}
              className="flex items-center justify-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-2 text-xs font-medium text-white hover:bg-white/10 transition disabled:opacity-50"
              title="Télécharger l'image PNG haute définition (2024 x 1276 px)"
            >
              <Download size={13} />
              <span>Image HD</span>
            </button>

            <button
              type="button"
              onClick={() => setShowRegenConfirm(true)}
              className="flex items-center justify-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-2 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition"
              title="Génère un nouveau jeton QR si la carte a été égarée ou compromise"
            >
              <RefreshCw size={13} />
              <span>Régénérer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
