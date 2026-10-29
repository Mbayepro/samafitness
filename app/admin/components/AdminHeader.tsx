"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ScanLine, UserPlus, CreditCard } from "lucide-react";
import type { AdminContext } from "@/lib/auth/admin";
import { usePwaInstall } from "@/lib/pwa";

interface AdminHeaderProps {
  admin: AdminContext;
  isSuperAdmin: boolean;
  onOpenPassword: () => void;
  onLogout: () => void;
  onOpenScanner?: () => void;
  onOpenNewMember?: () => void;
  onOpenNewPayment?: () => void;
}

export default function AdminHeader({
  admin,
  isSuperAdmin,
  onOpenPassword,
  onLogout,
  onOpenScanner,
  onOpenNewMember,
  onOpenNewPayment,
}: AdminHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { canInstall, install } = usePwaInstall();

  const isDemoVisible = admin.isDemo && process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  // Fermer le menu au clic extérieur ou touche Échap
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  const initial = (admin.email?.[0] || "A").toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0c0c0c]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2.5 sm:px-6 sm:py-3.5">
        {/* Logo & Rôle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-base font-black tracking-tight sm:text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 rounded-lg"
          >
            <span className="text-white">SAMBA</span>
            <span className="text-lime-400">FITNESS</span>
            <span className="rounded-full border border-lime-400/40 bg-lime-400/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-lime-400">
              ADMIN
            </span>
          </Link>

          {isDemoVisible && (
            <span className="hidden items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-400 md:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>Mode Démo</span>
            </span>
          )}
        </div>

        {/* Actions Globales 1-Clic + Menu profil déroulant */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {onOpenScanner && (
            <button
              type="button"
              onClick={onOpenScanner}
              className="inline-flex items-center gap-1.5 rounded-full bg-lime-400 px-3 py-1.5 text-xs font-bold text-black transition hover:bg-lime-300 shadow-sm"
              title="Scanner une carte QR Membre"
            >
              <ScanLine size={14} strokeWidth={2.2} />
              <span>Scanner QR</span>
            </button>
          )}

          {onOpenNewPayment && (
            <button
              type="button"
              onClick={onOpenNewPayment}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500 hover:text-black"
              title="Encaisser un règlement"
            >
              <CreditCard size={13} />
              <span>Encaisser</span>
            </button>
          )}

          {onOpenNewMember && (
            <button
              type="button"
              onClick={onOpenNewMember}
              className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/90 transition hover:bg-white/10"
              title="Inscrire un nouvel adhérent"
            >
              <UserPlus size={13} />
              <span>+ Membre</span>
            </button>
          )}

          <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-expanded={isMenuOpen}
            aria-haspopup="true"
            aria-label="Menu du profil administrateur"
            className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 py-1 pl-1.5 pr-2.5 text-xs font-bold text-white transition hover:border-lime-400/50 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-lime-400 text-xs font-black text-black">
              {initial}
            </span>
            <span className="hidden max-w-[140px] truncate text-left sm:inline-block">
              {admin.email?.split("@")[0] || "Compte"}
            </span>
            <svg
              className={`h-3.5 w-3.5 text-white/60 transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Panneau déroulant */}
          {isMenuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl border border-white/15 bg-[#121212] p-2 shadow-2xl backdrop-blur-2xl ring-1 ring-black/50 z-50 animate-in fade-in zoom-in-95 duration-100"
            >
              {/* Infos utilisateur */}
              <div className="border-b border-white/10 px-3 py-2.5">
                <p className="truncate text-xs font-black text-white" title={admin.email}>
                  {admin.email}
                </p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span
                    className={`inline-block h-1.5 w-1.5 rounded-full ${
                      isSuperAdmin ? "bg-lime-400" : "bg-cyan-400"
                    }`}
                  />
                  <span className="text-[11px] font-semibold text-white/60">
                    {isSuperAdmin ? "Super-administrateur" : "Gérant"}
                  </span>
                </div>
              </div>

              <div className="py-1">
                {/* Installer l'application (visible uniquement si éligible) */}
                {canInstall && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={async () => {
                      setIsMenuOpen(false);
                      await install();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-lime-400 transition hover:bg-lime-400/10 text-left"
                  >
                    <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Installer l&apos;application</span>
                  </button>
                )}

                {/* Mot de passe */}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenPassword();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-white/90 transition hover:bg-white/10 hover:text-white text-left"
                >
                  <svg className="h-4 w-4 flex-shrink-0 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  <span>Mot de passe</span>
                </button>

                {/* Voir le site */}
                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  role="menuitem"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-white/90 transition hover:bg-white/10 hover:text-white text-left"
                >
                  <svg className="h-4 w-4 flex-shrink-0 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span>Voir le site</span>
                  <span className="text-[10px] text-white/40 ml-auto">↗</span>
                </a>
              </div>

              {/* Déconnexion */}
              <div className="border-t border-white/10 pt-1">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onLogout();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-red-400 transition hover:bg-red-500/10 hover:text-red-300 text-left"
                >
                  <svg className="h-4 w-4 flex-shrink-0 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </header>
  );
}
