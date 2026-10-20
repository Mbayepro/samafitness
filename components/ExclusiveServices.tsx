"use client";

export default function ExclusiveServices() {
  return (
    <section className="border-t border-white/10 bg-[#0a0a0a] py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Fitness Park Spotlight Header */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-lime-400/30 bg-lime-400/10 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-lime-400">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />
              <span>Écosystème & Digital</span>
            </div>
            <h2 className="mt-4 text-4xl font-black uppercase tracking-tight text-white sm:text-5xl md:text-6xl">
              NOS SERVICES EXCLUSIFS
            </h2>
            <p className="mt-4 max-w-2xl text-base text-white/70 sm:text-lg">
              Une expérience sportive connectée qui ne s&apos;arrête pas à la porte du club. Retrouve tes programmes, tes coachs et ton suivi où que tu sois.
            </p>
          </div>
        </div>

        {/* 2 Big Spotlight Banners like Fitness Park */}
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {/* Spotlight 1: Application Mobile */}
          <div className="group relative overflow-hidden rounded-3xl border border-white/15 bg-[#121212] p-8 transition-all duration-300 hover:border-lime-400/50 hover:shadow-2xl hover:shadow-lime-400/10 sm:p-10">
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <span className="inline-block rounded-full bg-lime-400 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-black">
                  APP CONNECTÉE
                </span>
                <h3 className="mt-5 text-2xl font-black uppercase leading-tight text-white sm:text-3xl">
                  Ton application Samba qui t&apos;accompagne avant, pendant et après ta séance
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-white/70">
                  Accède à ton club avec ton QR code digital, consulte l&apos;affluence en temps réel, réserve tes cours collectifs et suis tes records personnels en un coup d&apos;œil.
                </p>

                <ul className="mt-6 space-y-2.5 text-xs text-white/80">
                  <li className="flex items-center gap-2">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-lime-400/20 text-lime-400">
                      <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span>Badge d&apos;accès digital sécurisé sur smartphone</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-lime-400/20 text-lime-400">
                      <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span>Affluence en direct dans votre club à Ndioum</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-lime-400/20 text-lime-400">
                      <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span>+300 programmes et tutoriels vidéo guidés</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4">
                <a
                  href="#essai-gratuit"
                  className="inline-flex items-center gap-2 rounded-full border border-lime-400/40 bg-lime-400/10 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-lime-400 transition hover:bg-lime-400 hover:text-black"
                >
                  <span>Découvrir l&apos;application</span>
                  <span>→</span>
                </a>
              </div>
            </div>

            {/* Subtle background decorative silhouette */}
            <div className="pointer-events-none absolute -bottom-10 -right-10 h-72 w-72 rounded-full bg-lime-400/10 blur-3xl group-hover:bg-lime-400/20 transition-all duration-500" />
          </div>

          {/* Spotlight 2: Home Training & Nutrition */}
          <div className="group relative overflow-hidden rounded-3xl border border-white/15 bg-[#121212] p-8 transition-all duration-300 hover:border-lime-400/50 hover:shadow-2xl hover:shadow-lime-400/10 sm:p-10">
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <span className="inline-block rounded-full bg-white/10 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-lime-400">
                  HOME TRAINING HD
                </span>
                <h3 className="mt-5 text-2xl font-black uppercase leading-tight text-white sm:text-3xl">
                  Entraîne-toi où tu veux, quand tu veux avec nos coachs certifiés
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-white/70">
                  En déplacement ou chez toi, ne brise jamais ta dynamique. Profite de plus de 150 sessions vidéos HD à la demande adaptées à tous tes objectifs physiques.
                </p>

                <ul className="mt-6 space-y-2.5 text-xs text-white/80">
                  <li className="flex items-center gap-2">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-lime-400/20 text-lime-400">
                      <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span>Sessions HIIT, Yoga, Mobilité et Renforcement</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-lime-400/20 text-lime-400">
                      <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span>Conseils nutrition & macro-nutriments personnalisés</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-lime-400/20 text-lime-400">
                      <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span>Inclus dans toutes les formules Samba Fitness</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4">
                <a
                  href="#essai-gratuit"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white transition hover:border-lime-400 hover:text-lime-400"
                >
                  <span>Je commence mon entraînement</span>
                  <span>→</span>
                </a>
              </div>
            </div>

            <div className="pointer-events-none absolute -bottom-10 -right-10 h-72 w-72 rounded-full bg-white/5 blur-3xl group-hover:bg-white/10 transition-all duration-500" />
          </div>
        </div>
      </div>
    </section>
  );
}
