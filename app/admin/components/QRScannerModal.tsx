"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, Check, AlertTriangle, CreditCard, Camera, ScanLine } from "lucide-react";
import { logger } from "@/lib/logger";
import { formatMemberNumber } from "./ui/AdminFormatters";
import { checkInByQrTokenAction } from "@/app/actions/gym-actions";

interface QRScannerModalProps {
  onClose: () => void;
  showFeedback?: (type: "success" | "error", text: string) => void;
  onOpenPaymentModal?: (memberId?: string) => void;
  onAttendanceRecorded?: () => void;
  // Optionnel pour rétro-compatibilité des props existantes
  members?: unknown[];
  onCheckInMember?: (memberId: string) => Promise<void>;
}

type ScanStatus =
  | { type: "idle" }
  | { type: "processing" }
  | {
      type: "success";
      memberName: string;
      memberNumber?: number | null;
      planId?: string;
      message: string;
    }
  | {
      type: "expired";
      memberId?: string;
      memberName?: string;
      error: string;
    }
  | {
      type: "duplicate";
      memberName?: string;
      error: string;
    }
  | {
      type: "error";
      error: string;
    };

export default function QRScannerModal({
  onClose,
  showFeedback,
  onOpenPaymentModal,
  onAttendanceRecorded,
}: QRScannerModalProps) {
  const [manualCode, setManualCode] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<ScanStatus>({ type: "idle" });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);
  const isProcessingRef = useRef<boolean>(false);

  // Émission d'un bip sonore de confirmation
  const playBeep = useCallback((success = true) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(success ? 880 : 330, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + (success ? 0.15 : 0.3));
    } catch {
      // Audio bloqué ou non supporté
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Traitement direct du jeton auprès du serveur (seule source de vérité)
  const processRawToken = useCallback(
    async (raw: string) => {
      const trimmed = (raw || "").trim();
      if (!trimmed || isProcessingRef.current) return;

      isProcessingRef.current = true;
      stopCamera();
      setScanStatus({ type: "processing" });

      try {
        const res = await checkInByQrTokenAction(trimmed);

        if (res.success) {
          playBeep(true);
          setScanStatus({
            type: "success",
            memberName: res.memberName,
            memberNumber: res.member.member_number,
            planId: res.member.plan_id,
            message: res.message,
          });
          showFeedback?.("success", res.message);
          onAttendanceRecorded?.();
        } else {
          playBeep(false);
          if (res.isExpired) {
            setScanStatus({
              type: "expired",
              memberId: res.memberId,
              memberName: res.memberName,
              error: res.error,
            });
          } else if (res.isDuplicate) {
            setScanStatus({
              type: "duplicate",
              memberName: res.memberName,
              error: res.error,
            });
          } else {
            setScanStatus({
              type: "error",
              error: res.error || "Jeton QR non reconnu ou invalide.",
            });
          }
        }
      } catch {
        playBeep(false);
        setScanStatus({
          type: "error",
          error: "Erreur de communication avec le serveur lors du pointage.",
        });
      } finally {
        isProcessingRef.current = false;
      }
    },
    [onAttendanceRecorded, playBeep, showFeedback, stopCamera]
  );

  // Démarrage de la caméra avec détection native de codes-barres
  const startCamera = async () => {
    setCameraError(null);
    setScanStatus({ type: "idle" });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);

        // API native BarcodeDetector
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const win = window as any;
        if ("BarcodeDetector" in win) {
          const detector = new win.BarcodeDetector({ formats: ["qr_code"] });
          scanIntervalRef.current = window.setInterval(async () => {
            if (!videoRef.current || videoRef.current.readyState < 2 || isProcessingRef.current) {
              return;
            }
            try {
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes && barcodes.length > 0) {
                const rawValue = barcodes[0].rawValue;
                if (rawValue) {
                  await processRawToken(rawValue);
                }
              }
            } catch {
              // Frame de scan ignorée
            }
          }, 250);
        } else {
          setCameraError(
            "Votre navigateur ne supporte pas la détection automatique de QR en direct. Utilisez la saisie ou la douchette ci-dessous."
          );
        }
      }
    } catch (err) {
      logger.error({ err }, "Erreur d'accès à la caméra pour le scan");
      setCameraError(
        "Accès caméra refusé ou indisponible. Vérifiez les autorisations de votre navigateur."
      );
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    const token = manualCode.trim();
    setManualCode("");
    processRawToken(token);
  };

  const handleResetScan = () => {
    setScanStatus({ type: "idle" });
    setManualCode("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-white/15 bg-[#121214] p-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-lime-400/15 text-lime-400 font-bold text-xs">
              <ScanLine size={15} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">Scanner d&apos;entrée QR & Douchette</h3>
              <p className="text-[11px] text-white/50">
                Pointage sécurisé en direct • Contrôle serveur instantané
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            aria-label="Fermer"
            className="flex h-7 w-7 items-center justify-center rounded-md text-white/50 hover:bg-white/10 hover:text-white transition"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </div>

        {/* ── ÉCRAN DE TRAITEMENT ─────────────────────────────────────────── */}
        {scanStatus.type === "processing" && (
          <div className="my-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-lime-400 border-t-transparent" />
            <p className="text-sm font-semibold text-white">Validation auprès du serveur...</p>
            <p className="text-xs text-white/50">Vérification de l&apos;abonnement et anti-doublon</p>
          </div>
        )}

        {/* ── CAS 1 : SUCCÈS VALIDATION ENTRÉE ────────────────────────────── */}
        {scanStatus.type === "success" && (
          <div className="mt-5 rounded-lg border border-lime-400/40 bg-lime-400/10 p-5 text-center animate-fade-in">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-lime-400 text-black">
              <Check size={24} strokeWidth={2.5} />
            </div>
            <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-lime-400">
              Pointage validé
            </p>
            <h4 className="mt-1 text-xl font-bold text-white">{scanStatus.memberName}</h4>
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="font-mono text-xs text-lime-300 font-semibold rounded border border-lime-400/30 bg-lime-400/10 px-2 py-0.5">
                {formatMemberNumber(scanStatus.memberNumber)}
              </span>
              <span className="text-xs uppercase text-white/70 font-medium">
                {scanStatus.planId}
              </span>
            </div>
            <p className="mt-3 text-xs text-lime-200/90">{scanStatus.message}</p>

            <div className="mt-5 flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleResetScan}
                className="flex-1 rounded-md border border-white/15 bg-white/5 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition"
              >
                Scanner un autre membre
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-md bg-lime-400 py-2.5 text-xs font-bold text-black hover:bg-lime-300 transition"
              >
                Terminer
              </button>
            </div>
          </div>
        )}

        {/* ── CAS 2 : REFUS STRICT ABONNEMENT EXPIRÉ ──────────────────────── */}
        {scanStatus.type === "expired" && (
          <div className="mt-5 rounded-lg border border-red-500/40 bg-red-500/10 p-5 text-center animate-fade-in">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-red-500 text-white">
              <AlertTriangle size={24} strokeWidth={2.5} />
            </div>
            <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-red-400">
              Accès refusé
            </p>
            <h4 className="mt-1 text-lg font-bold text-white">
              {scanStatus.memberName || "Abonnement expiré"}
            </h4>
            <div className="mt-3 rounded-md border border-red-500/25 bg-red-950/40 p-3 text-xs text-red-200">
              {scanStatus.error}
            </div>

            <div className="mt-5 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPaymentModal?.(scanStatus.memberId);
                }}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-md bg-emerald-500 py-2.5 text-xs font-bold text-white hover:bg-emerald-400 transition"
              >
                <CreditCard size={14} />
                <span>Encaisser un paiement</span>
              </button>
              <button
                type="button"
                onClick={handleResetScan}
                className="w-full sm:w-auto rounded-md border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition"
              >
                Scanner un autre
              </button>
            </div>
          </div>
        )}

        {/* ── CAS 3 : DOUBLON DU JOUR CALENDAIRE (AFRICA/DAKAR) ────────────── */}
        {scanStatus.type === "duplicate" && (
          <div className="mt-5 rounded-lg border border-amber-500/40 bg-amber-500/10 p-5 text-center animate-fade-in">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-amber-500 text-black">
              <AlertTriangle size={24} strokeWidth={2.5} />
            </div>
            <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Pointage déjà enregistré
            </p>
            <h4 className="mt-1 text-lg font-bold text-white">{scanStatus.memberName}</h4>
            <div className="mt-3 rounded-md border border-amber-500/25 bg-amber-950/40 p-3 text-xs text-amber-200">
              {scanStatus.error}
            </div>
            <div className="mt-5 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={handleResetScan}
                className="rounded-md border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition"
              >
                Scanner un autre membre
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md bg-white/10 px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/20 transition"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* ── CAS 4 : ERREUR JETON INVALIDE ───────────────────────────────── */}
        {scanStatus.type === "error" && (
          <div className="mt-5 rounded-lg border border-red-500/40 bg-red-500/10 p-5 text-center animate-fade-in">
            <p className="text-sm font-bold text-red-300">Échec du pointage</p>
            <p className="mt-1 text-xs text-red-200/80">{scanStatus.error}</p>
            <button
              type="button"
              onClick={handleResetScan}
              className="mt-4 rounded-md border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* ── MODE SCAN NORMAL (Caméra + Saisie Douchette) ────────────────── */}
        {scanStatus.type === "idle" && (
          <div className="mt-4 space-y-4">
            {/* Zone Vidéo Caméra */}
            <div className="relative overflow-hidden rounded-lg border border-white/10 bg-black aspect-video w-full flex items-center justify-center">
              {cameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="h-full w-full object-cover"
                  />
                  {/* Viseur de scan sobre */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="h-44 w-44 rounded-lg border-2 border-lime-400/80 bg-lime-400/5" />
                  </div>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="absolute bottom-2.5 right-2.5 rounded-md bg-red-600/90 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm hover:bg-red-600"
                  >
                    Arrêter la caméra
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white/5 text-lime-400">
                    <Camera size={20} />
                  </div>
                  <p className="text-xs font-semibold text-white">Scanner avec la caméra</p>
                  <p className="text-[11px] text-white/50 max-w-xs">
                    Présentez la carte ou le téléphone du membre devant l&apos;objectif.
                  </p>
                  {cameraError && (
                    <p className="text-xs text-amber-300 max-w-xs mt-1">{cameraError}</p>
                  )}
                  <button
                    type="button"
                    onClick={startCamera}
                    className="mt-2 rounded-md bg-lime-400 px-4 py-2 text-xs font-bold text-black hover:bg-lime-300 transition"
                  >
                    Activer la caméra
                  </button>
                </div>
              )}
            </div>

            {/* Saisie directe par douchette ou jeton */}
            <form onSubmit={handleManualSubmit} className="space-y-2">
              <label className="block text-xs font-semibold text-white/70">
                Ou scanner par douchette / saisie du jeton :
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Scannez ou collez le jeton (ex. sfc_...)"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  autoFocus
                  className="flex-1 rounded-md border border-white/10 bg-black/50 px-3.5 py-2.5 text-xs font-mono text-white placeholder-white/30 focus:border-lime-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!manualCode.trim()}
                  className="rounded-md border border-lime-400/30 bg-lime-400/10 px-4 py-2.5 text-xs font-semibold text-lime-400 hover:bg-lime-400 hover:text-black transition disabled:opacity-50"
                >
                  Valider
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
