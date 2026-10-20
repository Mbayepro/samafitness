"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Member } from "@/lib/gym-store";
import { logger } from "@/lib/logger";

interface QRScannerModalProps {
  members: Member[];
  onCheckInMember: (memberId: string) => Promise<void>;
  onClose: () => void;
  showFeedback: (type: "success" | "error", text: string) => void;
}

export default function QRScannerModal({
  members,
  onCheckInMember,
  onClose,
  showFeedback,
}: QRScannerModalProps) {
  const [manualCode, setManualCode] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedMember, setScannedMember] = useState<Member | null>(null);
  const [processing, setProcessing] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);

  const findMemberFromRaw = useCallback((raw: string): Member | null => {
    const trimmed = raw.trim();
    if (!trimmed) return null;

    // Try parsing JSON payload
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed.id) {
        const found = members.find((m) => m.id === parsed.id);
        if (found) return found;
      }
      if (parsed.phone) {
        const clean = parsed.phone.replace(/[^0-9]/g, "");
        const found = members.find((m) => m.phone.replace(/[^0-9]/g, "").includes(clean));
        if (found) return found;
      }
    } catch {
      // not JSON
    }

    // Direct ID match
    const byId = members.find((m) => m.id === trimmed || m.qr_token === trimmed);
    if (byId) return byId;

    // Phone match
    const cleanRaw = trimmed.replace(/[^0-9]/g, "");
    if (cleanRaw.length >= 7) {
      const byPhone = members.find((m) => m.phone.replace(/[^0-9]/g, "").includes(cleanRaw));
      if (byPhone) return byPhone;
    }

    // Name match
    const byName = members.find(
      (m) => m.full_name.toLowerCase() === trimmed.toLowerCase()
    );
    return byName || null;
  }, [members]);

  const handleRecognized = useCallback((member: Member) => {
    setScannedMember(member);
    // Beep sound effect using AudioContext
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // AudioContext unavailable or blocked
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

  // BarcodeDetector or Canvas Scanner loop
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);

        // Check if native BarcodeDetector API exists
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const win = window as any;
        if ("BarcodeDetector" in win) {
          const detector = new win.BarcodeDetector({ formats: ["qr_code", "ean_13", "code_128"] });
          scanIntervalRef.current = window.setInterval(async () => {
            if (!videoRef.current || videoRef.current.readyState < 2) return;
            try {
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes.length > 0) {
                const rawValue = barcodes[0].rawValue;
                const match = findMemberFromRaw(rawValue);
                if (match) {
                  stopCamera();
                  handleRecognized(match);
                }
              }
            } catch {
              // detection frame error
            }
          }, 300);
        }
      }
    } catch (err) {
      logger.error({ err }, "Camera access error");
      setCameraError(
        "Impossible d'accéder à la caméra. Vérifiez les autorisations du navigateur ou utilisez la saisie directe."
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
    const match = findMemberFromRaw(manualCode);
    if (match) {
      handleRecognized(match);
      setManualCode("");
    } else {
      showFeedback("error", `Aucun membre ne correspond au code : "${manualCode}"`);
    }
  };

  const handleConfirmCheckIn = async () => {
    if (!scannedMember) return;
    setProcessing(true);
    try {
      await onCheckInMember(scannedMember.id);
      if (scannedMember.status === "expire") {
        showFeedback(
          "error",
          `Attention : l'abonnement de ${scannedMember.full_name} est expiré !`
        );
      } else {
        showFeedback(
          "success",
          `Entrée validée pour ${scannedMember.full_name} !`
        );
      }
      onClose();
    } catch {
      showFeedback("error", "Erreur lors de la validation du pointage.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-[#121212] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-lime-400/20 text-lime-400 font-black text-xs">
              QR
            </span>
            <div>
              <h3 className="text-base font-black uppercase text-white">
                Scanner QR Code / Douchette
              </h3>
              <p className="text-[11px] text-white/50">
                Pointage automatique des présences à l&apos;entrée
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Scanned Member Alert & Confirmation */}
        {scannedMember ? (
          <div className="mt-6 rounded-2xl border-2 border-lime-400 bg-lime-400/5 p-6 text-center animate-fade-in">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-lime-400 text-black font-black text-xl shadow-lg shadow-lime-400/30">
              ✓
            </div>
            <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-lime-400">
              Membre Identifié
            </p>
            <h4 className="mt-1 text-2xl font-black text-white">
              {scannedMember.full_name}
            </h4>
            <p className="font-mono text-xs text-white/60">{scannedMember.phone}</p>

            <div className="mt-4 flex items-center justify-center gap-3">
              <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold uppercase text-white/90">
                {scannedMember.plan_id}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${
                  scannedMember.status === "actif"
                    ? "bg-lime-400/20 text-lime-400 border border-lime-400/40"
                    : scannedMember.status === "expire_bientot"
                    ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                    : "bg-red-500/20 text-red-400 border border-red-500/40"
                }`}
              >
                {scannedMember.status === "actif"
                  ? "Actif"
                  : scannedMember.status === "expire_bientot"
                  ? "Expire bientôt"
                  : "Expiré"}
              </span>
            </div>

            <p className="mt-2 text-xs text-white/60">
              Abonnement valide jusqu&apos;au {new Date(scannedMember.end_date).toLocaleDateString("fr-FR")}
            </p>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setScannedMember(null)}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-bold text-white hover:bg-white/10 transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmCheckIn}
                disabled={processing}
                className="flex-1 rounded-xl bg-lime-400 py-3 text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-lime-400/20 hover:bg-lime-300 transition"
              >
                {processing ? "Validation..." : "Valider l'entrée →"}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {/* Camera View Area */}
            <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-black">
              {cameraActive ? (
                <div className="relative aspect-video w-full">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="h-full w-full object-cover"
                  />
                  {/* Scan target reticle overlay */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="h-44 w-44 rounded-2xl border-2 border-dashed border-lime-400/80 bg-lime-400/5 animate-pulse" />
                  </div>
                  <button
                    onClick={stopCamera}
                    className="absolute bottom-3 right-3 rounded-xl bg-red-600/80 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur-md hover:bg-red-600"
                  >
                    Arrêter la caméra
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-xs font-black text-lime-400">
                    SCAN
                  </span>
                  <p className="mt-3 text-sm font-bold text-white">
                    Scanner avec la caméra
                  </p>
                  <p className="mt-1 text-xs text-white/50 max-w-xs">
                    Présentez le badge ou le téléphone du membre devant l&apos;objectif.
                  </p>
                  {cameraError && (
                    <p className="mt-2 text-xs text-red-400">{cameraError}</p>
                  )}
                  <button
                    type="button"
                    onClick={startCamera}
                    className="mt-4 rounded-xl bg-lime-400 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-black shadow-md shadow-lime-400/20 hover:bg-lime-300 transition"
                  >
                    Activer la caméra
                  </button>
                </div>
              )}
            </div>

            {/* Manual Saisie / Douchette Barcode Reader Input */}
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-white/70">
                Ou scanner par douchette / saisie rapide :
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Tapez le numéro de téléphone ou ID..."
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  autoFocus
                  className="flex-1 rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-xs text-white placeholder-white/30 focus:border-lime-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-xl border border-lime-400/40 bg-lime-400/10 px-5 py-3 text-xs font-black uppercase text-lime-400 hover:bg-lime-400 hover:text-black transition"
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
