"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSiteData } from "@/lib/site-context";

export default function Navbar() {
  const SITE_DATA = useSiteData();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="fixed left-0 right-0 top-0 z-50">
      {/* Fitness Park style Top Announcement Bar */}
      <div className="border-b border-lime-400/20 bg-lime-400/10 px-4 py-1.5 text-center text-[11px] font-bold uppercase tracking-wider text-lime-400 backdrop-blur-md sm:text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-lime-400" />
          <span>Rejoignez SAMBAFITNESS • {SITE_DATA.contact.address}, {SITE_DATA.contact.city}</span>
          <a href={`tel:${SITE_DATA.contact.phoneTel}`} className="hidden hover:underline md:inline">• {SITE_DATA.contact.phone}</a>
        </div>
      </div>

      {/* Main Header Bar */}
      <motion.div
        animate={{
          backgroundColor: scrolled ? "rgba(0, 0, 0, 0.92)" : "rgba(8, 8, 8, 0.65)",
          borderColor: scrolled ? "rgba(255, 255, 255, 0.12)" : "rgba(255, 255, 255, 0.05)",
          paddingTop: scrolled ? "0.75rem" : "1rem",
          paddingBottom: scrolled ? "0.75rem" : "1rem",
        }}
        transition={{ duration: 0.25 }}
        className="border-b backdrop-blur-xl transition-shadow shadow-lg shadow-black/40"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          {/* Brand Logo */}
          <a
            href="#accueil"
            className="group flex items-center gap-1.5 text-2xl font-black tracking-tight text-white transition"
            aria-label={SITE_DATA.brand.name}
          >
            <span className="font-sport tracking-wider text-2xl sm:text-3xl">{SITE_DATA.brand.shortName}</span>
            <span className="font-sport tracking-wider text-2xl sm:text-3xl text-lime-400 transition group-hover:drop-shadow-[0_0_12px_rgba(163,230,53,0.7)]">
              {SITE_DATA.brand.accentName}
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav
            className="hidden items-center gap-7 lg:flex"
            aria-label="Navigation principale"
          >
            {SITE_DATA.navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="group relative text-sm font-semibold tracking-wide text-white/80 transition-colors duration-200 hover:text-lime-400"
              >
                <span>{label}</span>
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-lime-400 transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
            {SITE_DATA.shop?.enabled && (
              <a
                href="#boutique"
                className="group relative inline-flex items-center gap-1.5 text-sm font-semibold tracking-wide text-amber-300/90 transition-colors duration-200 hover:text-amber-300"
              >
                <span>Boutique</span>
                <span className="rounded-full border border-amber-400/40 bg-amber-400/15 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-300">
                  Shop
                </span>
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-amber-400 transition-all duration-300 group-hover:w-full" />
              </a>
            )}
          </nav>

          {/* Action Button & Mobile Burger */}
          <div className="flex items-center gap-3">
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="#rejoindre"
              className="hidden rounded-full bg-lime-400 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-lime-400/25 transition sm:inline-block hover:bg-lime-300"
            >
              Rejoindre le club
            </motion.a>

            <button
              id="mobile-menu-btn"
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu de navigation"}
              aria-expanded={menuOpen}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:border-lime-400/50 hover:bg-white/10 lg:hidden"
            >
              <span className="relative flex h-5 w-5 flex-col items-center justify-center gap-[5px]">
                <span
                  className={`block h-0.5 w-5 rounded bg-white transition-all duration-300 ${
                    menuOpen ? "translate-y-[7px] rotate-45 bg-lime-400" : ""
                  }`}
                />
                <span
                  className={`block h-0.5 w-5 rounded bg-white transition-all duration-200 ${
                    menuOpen ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`block h-0.5 w-5 rounded bg-white transition-all duration-300 ${
                    menuOpen ? "-translate-y-[7px] -rotate-45 bg-lime-400" : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Drawer with AnimatePresence */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              id="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden border-t border-white/10 lg:hidden"
            >
              <nav
                className="flex flex-col gap-1 bg-black/95 px-6 py-6 backdrop-blur-2xl"
                aria-label="Navigation mobile"
              >
                <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
                  Menu Principal
                </p>
                {SITE_DATA.navLinks.map(({ href, label }, idx) => (
                  <motion.a
                    key={href}
                    href={href}
                    onClick={closeMenu}
                    initial={{ x: -16, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.05, duration: 0.2 }}
                    className="rounded-xl px-4 py-2.5 text-base font-bold text-white/90 transition-colors hover:bg-white/5 hover:text-lime-400"
                  >
                    {label}
                  </motion.a>
                ))}
                {SITE_DATA.shop?.enabled && (
                  <motion.a
                    href="#boutique"
                    onClick={closeMenu}
                    initial={{ x: -16, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-center justify-between rounded-xl px-4 py-2.5 text-base font-bold text-amber-300 transition-colors hover:bg-white/5"
                  >
                    <span>Boutique & Nutrition</span>
                    <span className="rounded-full border border-amber-400/40 bg-amber-400/15 px-2 py-0.5 text-[10px] font-black uppercase text-amber-300">
                      Samba Shop
                    </span>
                  </motion.a>
                )}

                <div className="my-2 border-t border-white/10 pt-2">
                  <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
                    Accès direct
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-white/60">
                    <a
                      href={`tel:${SITE_DATA.contact.phoneTel}`}
                      onClick={closeMenu}
                      className="rounded-lg px-3 py-2 hover:bg-white/5 hover:text-lime-400"
                    >
                      Appeler
                    </a>
                    <a
                      href="#coachs"
                      onClick={closeMenu}
                      className="rounded-lg px-3 py-2 hover:bg-white/5 hover:text-lime-400"
                    >
                      Coach
                    </a>
                    <a
                      href="#faq"
                      onClick={closeMenu}
                      className="rounded-lg px-3 py-2 hover:bg-white/5 hover:text-lime-400"
                    >
                      FAQ
                    </a>
                    <a
                      href="#rejoindre"
                      onClick={closeMenu}
                      className="rounded-lg px-3 py-2 hover:bg-white/5 hover:text-lime-400"
                    >
                      Nous rejoindre
                    </a>
                  </div>
                </div>

                <div className="pt-3">
                  <a
                    href="#rejoindre"
                    onClick={closeMenu}
                    className="block w-full rounded-full bg-lime-400 px-6 py-3.5 text-center text-xs font-black uppercase tracking-wider text-black transition hover:bg-lime-300"
                  >
                    Rejoindre le club
                  </a>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </header>
  );
}
