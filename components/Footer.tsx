"use client";

import { useSiteData } from "@/lib/site-context";

export default function Footer() {
  const SITE_DATA = useSiteData();
  const currentYear = 2026;

  return (
    <footer className="border-t border-white/10 bg-[#060606] text-white">
      {/* Fitness Park Reassurance Top Strip */}
      <div className="border-b border-white/10 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Reassurance 1 */}
            <div className="flex items-center gap-5 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-lime-400/30 bg-lime-400/10 text-lime-400">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-black uppercase text-white">
                  Route nationale, face à la mairie
                </h3>
                <p className="mt-1 text-xs text-white/60">
                  Ndioum, Sénégal • {SITE_DATA.contact.hoursText}
                </p>
              </div>
            </div>

            {/* Reassurance 2 */}
            <div className="flex items-center gap-5 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-lime-400/30 bg-lime-400/10 text-lime-400">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                  <path d="M4 22h16" />
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-black uppercase text-white">
                  5 services d&apos;entraînement
                </h3>
                <p className="mt-1 text-xs text-white/60">
                  Musculation, cardio, cross-training, boxe & cours collectifs
                </p>
              </div>
            </div>

            {/* Reassurance 3 */}
            <div className="flex items-center gap-5 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-lime-400/30 bg-lime-400/10 text-lime-400">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-black uppercase text-white">
                  Rejoignez-nous facilement
                </h3>
                <p className="mt-1 text-xs text-white/60">
                  Inscription simple sur place, par téléphone ou WhatsApp
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
            {/* Brand Info */}
            <div className="lg:col-span-2">
              <a
                href="#accueil"
                className="inline-flex items-center gap-1 text-3xl font-black tracking-tight"
              >
                <span>{SITE_DATA.brand.shortName}</span>
                <span className="text-lime-400">{SITE_DATA.brand.accentName}</span>
              </a>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
                {SITE_DATA.brand.description}
              </p>

              {/* Social Icons */}
              {SITE_DATA.socials.length > 0 && (
                <div className="mt-6 flex items-center gap-3">
                  {SITE_DATA.socials.map((social) => (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.name}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-bold text-white/80 transition hover:border-lime-400 hover:text-lime-400"
                    >
                      {social.name.substring(0, 2)}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation Links */}
            <div>
              <p className="mb-4 text-xs font-black uppercase tracking-widest text-lime-400">
                Navigation
              </p>
              <ul className="space-y-2.5 text-sm text-white/70">
                <li>
                  <a href="#accueil" className="transition-colors hover:text-lime-400">
                    Accueil
                  </a>
                </li>
                <li>
                  <a href="#services" className="transition-colors hover:text-lime-400">
                    Nos services
                  </a>
                </li>
                <li>
                  <a href="#salles" className="transition-colors hover:text-lime-400">
                    Nous trouver
                  </a>
                </li>
                <li>
                  <a href="#tarifs" className="transition-colors hover:text-lime-400">
                    Formules
                  </a>
                </li>
                <li>
                  <a href="#coachs" className="transition-colors hover:text-lime-400">
                    Notre coach
                  </a>
                </li>
                <li>
                  <a href="#faq" className="transition-colors hover:text-lime-400">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Nos Clubs */}
            <div>
              <p className="mb-4 text-xs font-black uppercase tracking-widest text-lime-400">
                Notre salle
              </p>
              <ul className="space-y-3.5 text-xs text-white/70">
                {SITE_DATA.salles.map((salle) => (
                  <li key={salle.id}>
                    <p className="font-bold text-white">{salle.name}</p>
                    <p className="text-white/50">{salle.address}</p>
                    <p className="text-white/50">{SITE_DATA.contact.mainCity}</p>
                    <a
                      href={salle.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-lime-400 text-[11px] font-bold hover:underline"
                    >
                      Itinéraire ↗
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <p className="mb-4 text-xs font-black uppercase tracking-widest text-lime-400">
                Contact & Accès
              </p>
              <ul className="space-y-2.5 text-sm text-white/70">
                <li>
                  <a
                    href={`tel:${SITE_DATA.contact.phoneTel}`}
                    className="transition hover:text-lime-400 font-mono text-xs"
                  >
                    {SITE_DATA.contact.phone}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${SITE_DATA.contact.email}`}
                    className="transition hover:text-lime-400 text-xs"
                  >
                    {SITE_DATA.contact.email}
                  </a>
                </li>
                <li className="text-xs text-white/50">{SITE_DATA.contact.mainCity}</li>
                <li className="pt-3">
                  <a
                    href="#rejoindre"
                    className="inline-block rounded-full bg-lime-400 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black hover:bg-lime-300 transition"
                  >
                    Nous rejoindre →
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/40 md:flex-row">
            <p>© {currentYear} {SITE_DATA.brand.name}. Tous droits réservés.</p>
            <div className="flex gap-6">
              <a href="#accueil" className="transition hover:text-white/80">
                Mentions Légales
              </a>
              <a href="#accueil" className="transition hover:text-white/80">
                Politique de Confidentialité
              </a>
              <a href="/admin" className="transition hover:text-lime-400 font-medium">
                Espace Admin
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
