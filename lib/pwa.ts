"use client";

import { useEffect, useState } from "react";

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<(canInstall: boolean) => void>();

export function setDeferredPrompt(e: BeforeInstallPromptEvent | null) {
  deferredPrompt = e;
  const available = Boolean(deferredPrompt);
  listeners.forEach((cb) => cb(available));
}

export function subscribePwa(cb: (canInstall: boolean) => void) {
  listeners.add(cb);
  cb(Boolean(deferredPrompt));
  return () => {
    listeners.delete(cb);
  };
}

export async function promptPwaInstall(): Promise<boolean> {
  if (!deferredPrompt) return false;
  try {
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setDeferredPrompt(null);
      return true;
    }
  } catch {
    // Échec silencieux
  }
  return false;
}

export function usePwaInstall() {
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    return subscribePwa(setCanInstall);
  }, []);

  return {
    canInstall,
    install: promptPwaInstall,
  };
}
