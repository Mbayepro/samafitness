"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { logger } from "@/lib/logger";
import {
  setDeferredPrompt,
  promptPwaInstall,
  type BeforeInstallPromptEvent,
} from "@/lib/pwa";

export default function PwaRegister() {
  const pathname = usePathname();
  const [hasPrompt, setHasPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // 1. Enregistrement du Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .catch((err) => logger.debug({ err }, "Service Worker registration notice"));
      });
    }

    // 2. Détection du prompt d'installation
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setHasPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    const installed = await promptPwaInstall();
    if (installed) {
      setHasPrompt(false);
    }
  };

  // Sur /admin, ne pas afficher le popup flottant (l'installation reste accessible via le menu profil)
  const isAdmin = pathname?.startsWith("/admin");
  if (isAdmin || !hasPrompt || dismissed) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Installation de l'application"
      className="fixed bottom-20 left-4 right-4 z-40 mx-auto max-w-md rounded-2xl border border-lime-400/40 bg-[#121212]/95 p-4 shadow-2xl backdrop-blur-xl sm:bottom-6 sm:left-auto sm:right-6"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-lime-400/10 border border-lime-400/30 text-lime-400 font-black text-base">
          SF
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black uppercase text-white tracking-wide">
            Installer l&apos;application
          </p>
          <p className="text-[11px] text-white/60 truncate">
            Accès rapide hors-ligne et scan QR instantané
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-white/40 hover:text-white p-1 text-sm"
          aria-label="Fermer"
        >
          ✕
        </button>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={handleInstallClick}
          className="flex-1 rounded-full bg-lime-400 py-2 px-3 text-center text-xs font-black uppercase tracking-wider text-black transition hover:bg-lime-300"
        >
          Installer
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-white/70 hover:bg-white/5"
        >
          Plus tard
        </button>
      </div>
    </div>
  );
}
