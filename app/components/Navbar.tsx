"use client";
import { useState, useEffect } from "react";

const navLinks = [
  { href: "#accueil", label: "Accueil" },
  { href: "#services", label: "Services" },
  { href: "#salles", label: "Nos salles" },
  { href: "#tarifs", label: "Tarifs" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 border-b border-white/10 transition-all duration-300 ${
        scrolled ? "bg-black/90 backdrop-blur-xl" : "bg-black/60 backdrop-blur-xl"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <a href="#accueil" className="text-2xl font-black tracking-tight">
          SAMBA<span className="text-lime-400">FITNESS</span>
        </a>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Navigation principale">
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-sm text-white/80 transition-colors duration-200 hover:text-lime-400"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#tarifs"
            className="hidden rounded-full bg-lime-400 px-5 py-2.5 text-sm font-bold text-black transition duration-200 hover:bg-lime-300 md:block"
          >
            Rejoindre
          </a>

          <button
            id="mobile-menu-btn"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 md:hidden"
          >
            <span className="relative flex h-5 w-5 flex-col items-center justify-center gap-[5px]">
              <span
                className={`block h-px w-5 bg-white transition-all duration-300 ${
                  menuOpen ? "translate-y-[6px] rotate-45" : ""
                }`}
              />
              <span
                className={`block h-px w-5 bg-white transition-all duration-200 ${
                  menuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-px w-5 bg-white transition-all duration-300 ${
                  menuOpen ? "-translate-y-[6px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={`overflow-hidden transition-all duration-500 ease-in-out md:hidden ${
          menuOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <nav
          className="flex flex-col gap-2 border-t border-white/10 bg-black/95 px-6 py-6"
          aria-label="Navigation mobile"
        >
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={closeMenu}
              className="rounded-xl px-4 py-3 text-base font-semibold text-white/80 transition-colors hover:bg-white/5 hover:text-lime-400"
            >
              {label}
            </a>
          ))}
          <a
            href="#tarifs"
            onClick={closeMenu}
            className="mt-3 rounded-full bg-lime-400 px-6 py-3 text-center text-sm font-bold text-black transition hover:bg-lime-300"
          >
            Rejoindre SAMBAFITNESS
          </a>
        </nav>
      </div>
    </header>
  );
}
