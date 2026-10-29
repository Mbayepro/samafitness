"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import jsQR from "jsqr";
import {
  X,
  Check,
  AlertTriangle,
  CreditCard,
  Camera,
  ScanLine,
  SwitchCamera,
  ImagePlus,
  RefreshCw,
} from "lucide-react";
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
  const [cameraStarting, setCameraStarting] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<ScanStatus>({ type: "idle" });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setCameraStarting(false);
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

  // Démarrage de la caméra compatible iOS Safari + Android Chrome + Desktop
  const startCamera = useCallback(
    async (targetFacingMode: "environment" | "user" = facingMode) => {
      stopCamera();
      setCameraError(null);
      setScanStatus({ type: "idle" });
      setCameraStarting(true);

      // Vérifier si l'API mediaDevices est disponible (bloquée en HTTP non-localhost sur mobile)
      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices ||
        typeof navigator.mediaDevices.getUserMedia !== "function"
      ) {
        setCameraStarting(false);
        setCameraError(
          "La caméra en direct nécessite une connexion sécurisée (HTTPS). Utilisez le bouton « Prendre en photo le QR » ci-dessous qui fonctionne sur tous les téléphones."
        );
        return;
      }

      try {
        let stream: MediaStream;
        try {
          // 1re tentative avec la caméra souhaitée (arrière par défaut)
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: targetFacingMode },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });
        } catch {
          // 2e tentative universelle sans contraintes strictes (évite OverconstrainedError sur certains mobiles)
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        streamRef.current = stream;

        const video = videoRef.current;
        if (!video) {
          stopCamera();
          return;
        }

        video.srcObject = stream;
        video.setAttribute("playsinline", "true");
        video.muted = true;

        await video.play();
        setCameraActive(true);
        setCameraStarting(false);

        // Préparation du détecteur : BarcodeDetector natif SI disponible + jsQR universel (iOS / Firefox / Android WebView)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const win = window as any;
        let nativeDetector: { detect: (source: HTMLVideoElement) => Promise<{ rawValue?: string }[]> } | null = null;
        if ("BarcodeDetector" in win) {
          try {
            nativeDetector = new win.BarcodeDetector({ formats: ["qr_code"] });
          } catch {
            nativeDetector = null;
          }
        }

        const offscreenCanvas = canvasRef.current || document.createElement("canvas");
        const offscreenCtx = offscreenCanvas.getContext("2d", { willReadFrequently: true });

        scanIntervalRef.current = window.setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2 || isProcessingRef.current) {
            return;
          }

          const v = videoRef.current;

          // 1. Essayer BarcodeDetector natif si supporté
          if (nativeDetector) {
            try {
              const barcodes = await nativeDetector.detect(v);
              if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
                await processRawToken(barcodes[0].rawValue);
                return;
              }
            } catch {
              // Ignorer et passer au décodage jsQR sur canvas
            }
          }

          // 2. Décodage universel jsQR via Canvas (fonctionne sur 100 % des iPhone, iPad et Android)
          if (offscreenCtx && v.videoWidth > 0 && v.videoHeight > 0) {
            try {
              // Redimensionner à max 640px de large pour un décodage ultra-rapide sur mobile
              const scale = Math.min(1, 640 / v.videoWidth);
              const w = Math.floor(v.videoWidth * scale);
              const h = Math.floor(v.videoHeight * scale);
              offscreenCanvas.width = w;
              offscreenCanvas.height = h;
              offscreenCtx.drawImage(v, 0, 0, w, h);

              const imageData = offscreenCtx.getImageData(0, 0, w, h);
              const qrResult = jsQR(imageData.data, w, h, {
                inversionAttempts: "dontInvert",
              });

              if (qrResult && qrResult.data) {
                await processRawToken(qrResult.data);
              }
            } catch {
              // Frame ignorée
            }
          }
        }, 200);
      } catch (err) {
        logger.error({ err }, "Erreur d'accès à la caméra pour le scan");
        setCameraStarting(false);
        setCameraActive(false);
        setCameraError(
          "Accès caméra refusé ou indisponible. Autorisez la caméra dans votre navigateur ou utilisez « Prendre en photo le QR » ci-dessous."
        );
      }
    },
    [facingMode, processRawToken, stopCamera]
  );

  // Basculer entre caméra arrière et caméra avant
  const handleToggleCamera = () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
    void startCamera(nextMode);
  };

  // Scan depuis une photo prise avec l'appareil photo natif du téléphone (100% compatible même sans HTTPS)
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setCameraError(null);
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = canvasRef.current || document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setCameraError("Impossible d'analyser l'image.");
        return;
      }

      // Redimensionnement max 1200px pour un décodage précis
      const maxDim = 1200;
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.floor(img.width * scale);
      const h = Math.floor(img.height * scale);
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);

      const imageData = ctx.getImageData(0, 0, w, h);
      const code = jsQR(imageData.data, w, h, {
        inversionAttempts: "attemptBoth",
      });

      if (code && code.data) {
        void processRawToken(code.data);
      } else {
        playBeep(false);
        setCameraError(
          "Aucun QR code détecté sur la photo. Rapprochez-vous de la carte avec un bon éclairage et réessayez."
        );
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setCameraError("Impossible de lire le fichier photo.");
    };

    img.src = objectUrl;
  };

  // Démarrer automatiquement la caméra à l'ouverture de la modale
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void startCamera("environment");
    }, 100);
    return () => {
      window.clearTimeout(timer);
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    const token = manualCode.trim();
    setManualCode("");
    void processRawToken(token);
  };

  const handleResetScan = () => {
    setScanStatus({ type: "idle" });
    setManualCode("");
    void startCamera(facingMode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-sm">
      {/* Canvas hors-écran pour décodage jsQR */}
      <canvas ref={canvasRef} className="hidden" />
      {/* Input photo natif de secours */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageFileUpload}
        className="hidden"
      />

      <div className="w-full max-w-lg max-h-[94vh] overflow-y-auto rounded-2xl border border-white/15 bg-[#121214] p-4 sm:p-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime-400/15 text-lime-400 font-bold text-xs">
              <ScanLine size={17} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">Scanner Carte Membre (QR)</h3>
              <p className="text-[11px] text-white/50">
                Compatible iPhone, Android, Webcam & Douchette
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
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        {/* ── ÉCRAN DE TRAITEMENT ─────────────────────────────────────────── */}
        {scanStatus.type === "processing" && (
          <div className="my-10 flex flex-col items-center justify-center text-center space-y-3">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-lime-400 border-t-transparent" />
            <p className="text-sm font-semibold text-white">Validation auprès du serveur...</p>
            <p className="text-xs text-white/50">Vérification de l&apos;abonnement et anti-doublon</p>
          </div>
        )}

        {/* ── CAS 1 : SUCCÈS VALIDATION ENTRÉE ────────────────────────────── */}
        {scanStatus.type === "success" && (
          <div className="mt-5 rounded-xl border border-lime-400/40 bg-lime-400/10 p-5 text-center animate-fade-in">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-lime-400 text-black">
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
                className="flex-1 rounded-xl border border-white/15 bg-white/5 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition"
              >
                Scanner un autre
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl bg-lime-400 py-2.5 text-xs font-bold text-black hover:bg-lime-300 transition"
              >
                Terminer
              </button>
            </div>
          </div>
        )}

        {/* ── CAS 2 : REFUS STRICT ABONNEMENT EXPIRÉ ──────────────────────── */}
        {scanStatus.type === "expired" && (
          <div className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 p-5 text-center animate-fade-in">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-500 text-white">
              <AlertTriangle size={24} strokeWidth={2.5} />
            </div>
            <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-red-400">
              Accès refusé — Abonnement expiré
            </p>
            <h4 className="mt-1 text-lg font-bold text-white">
              {scanStatus.memberName || "Membre expiré"}
            </h4>
            <div className="mt-3 rounded-lg border border-red-500/25 bg-red-950/40 p-3 text-xs text-red-200">
              {scanStatus.error}
            </div>

            <div className="mt-5 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  onClose();
                  onOpenPaymentModal?.(scanStatus.memberId);
                }}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-black hover:bg-emerald-400 transition"
              >
                <CreditCard size={14} />
                <span>Encaisser le renouvellement</span>
              </button>
              <button
                type="button"
                onClick={handleResetScan}
                className="w-full sm:w-auto rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition"
              >
                Scanner un autre
              </button>
            </div>
          </div>
        )}

        {/* ── CAS 3 : DOUBLON DU JOUR CALENDAIRE (AFRICA/DAKAR) ────────────── */}
        {scanStatus.type === "duplicate" && (
          <div className="mt-5 rounded-xl border border-amber-500/40 bg-amber-500/10 p-5 text-center animate-fade-in">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-black">
              <AlertTriangle size={24} strokeWidth={2.5} />
            </div>
            <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Pointage déjà enregistré aujourd&apos;hui
            </p>
            <h4 className="mt-1 text-lg font-bold text-white">{scanStatus.memberName}</h4>
            <div className="mt-3 rounded-lg border border-amber-500/25 bg-amber-950/40 p-3 text-xs text-amber-200">
              {scanStatus.error}
            </div>
            <div className="mt-5 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={handleResetScan}
                className="flex-1 rounded-xl border border-white/15 bg-white/5 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition"
              >
                Scanner un autre
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl bg-white/10 py-2.5 text-xs font-semibold text-white hover:bg-white/20 transition"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* ── CAS 4 : ERREUR JETON INVALIDE ───────────────────────────────── */}
        {scanStatus.type === "error" && (
          <div className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 p-5 text-center animate-fade-in">
            <p className="text-sm font-bold text-red-300">Échec du pointage</p>
            <p className="mt-1 text-xs text-red-200/80">{scanStatus.error}</p>
            <button
              type="button"
              onClick={handleResetScan}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10"
            >
              <RefreshCw size={13} />
              <span>Réessayer</span>
            </button>
          </div>
        )}

        {/* ── MODE SCAN NORMAL (Caméra Live + Photo Mobile + Douchette) ──── */}
        {scanStatus.type === "idle" && (
          <div className="mt-4 space-y-4">
            {/* Zone Vidéo Caméra (Le <video> reste toujours dans le DOM pour être disponible au ref) */}
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black aspect-[4/3] sm:aspect-video w-full flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className={`h-full w-full object-cover ${cameraActive ? "block" : "hidden"}`}
              />

              {cameraActive ? (
                <>
                  {/* Viseur de scan animé */}
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <div className="relative h-48 w-48 sm:h-52 sm:w-52 rounded-2xl border-2 border-lime-400/90 bg-lime-400/5 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                      <span className="absolute -top-0.5 -left-0.5 h-5 w-5 border-t-4 border-l-4 border-lime-400 rounded-tl-lg" />
                      <span className="absolute -top-0.5 -right-0.5 h-5 w-5 border-t-4 border-r-4 border-lime-400 rounded-tr-lg" />
                      <span className="absolute -bottom-0.5 -left-0.5 h-5 w-5 border-b-4 border-l-4 border-lime-400 rounded-bl-lg" />
                      <span className="absolute -bottom-0.5 -right-0.5 h-5 w-5 border-b-4 border-r-4 border-lime-400 rounded-br-lg" />
                    </div>
                    <span className="mt-3 rounded-full bg-black/75 px-3 py-1 text-[11px] font-semibold text-lime-300 backdrop-blur-sm">
                      Placez le QR code dans le cadre…
                    </span>
                  </div>

                  {/* Contrôles caméra superposés */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={handleToggleCamera}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-black/75 border border-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md hover:bg-black"
                      title="Changer de caméra (Avant / Arrière)"
                    >
                      <SwitchCamera size={14} />
                      <span>Tourner</span>
                    </button>

                    <button
                      type="button"
                      onClick={stopCamera}
                      className="rounded-lg bg-red-600/90 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md hover:bg-red-600"
                    >
                      Arrêter
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-5 text-center space-y-2.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-400/10 text-lime-400">
                    <Camera size={22} />
                  </div>
                  <p className="text-xs font-bold text-white">
                    {cameraStarting ? "Ouverture de la caméra..." : "Caméra prête à scanner"}
                  </p>
                  <p className="text-[11px] text-white/50 max-w-xs">
                    Présentez la carte ou le smartphone du membre devant l&apos;objectif.
                  </p>
                  {cameraError && (
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-[11px] text-amber-200 max-w-xs">
                      {cameraError}
                    </div>
                  )}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      disabled={cameraStarting}
                      onClick={() => void startCamera(facingMode)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-lime-400 px-4 py-2.5 text-xs font-bold text-black hover:bg-lime-300 transition disabled:opacity-50"
                    >
                      <Camera size={14} />
                      <span>{cameraStarting ? "Activation…" : "Activer la caméra"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition"
                    >
                      <ImagePlus size={14} />
                      <span>Prendre en photo le QR</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bouton de secours rapide Photo sur mobile quand la caméra tourne */}
            {cameraActive && (
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2 text-xs">
                <span className="text-white/50 text-[11px]">
                  Flou ou difficile à cadrer ?
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 font-semibold text-lime-400 hover:underline"
                >
                  <ImagePlus size={13} />
                  <span>Scanner via l&apos;appareil photo</span>
                </button>
              </div>
            )}

            {/* Saisie directe par numéro de membre (SF-0001), douchette ou jeton */}
            <form onSubmit={handleManualSubmit} className="space-y-1.5 pt-1 border-t border-white/10">
              <label className="block text-xs font-semibold text-white/70">
                Ou saisir le N° membre (ex: SF-0001) / douchette USB :
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ex: SF-0001 ou jeton sfc_..."
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="flex-1 rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-xs font-mono text-white placeholder-white/30 focus:border-lime-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!manualCode.trim()}
                  className="rounded-xl bg-lime-400 px-4 py-2.5 text-xs font-bold text-black hover:bg-lime-300 transition disabled:opacity-40"
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
