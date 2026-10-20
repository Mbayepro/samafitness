"use client";

export default function LevelUp() {
  return (
    <section className="relative overflow-hidden border-t border-white/10 bg-[#070707] py-28">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute right-1/4 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-lime-400/5 blur-[160px]" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Visual Level Up Badge & Card */}
          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-3xl border border-lime-400/30 bg-gradient-to-br from-[#141414] via-[#0c0c0c] to-black p-8 shadow-2xl shadow-lime-400/10">
              {/* Metallic highlight ribbon */}
              <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-lime-400/20 blur-2xl" />

              <div className="flex items-center justify-between border-b border-white/10 pb-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-400">
                    EXCLUSIVITÉ SAMBAFITNESS
                  </p>
                  <h3 className="mt-1 text-2xl font-black uppercase tracking-tight text-white">
                    LEVEL UP
                  </h3>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-400 text-black shadow-lg shadow-lime-400/30">
                  <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
              </div>

              {/* 3 Interactive Ranks */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-lime-400/40">
                  <div className="flex items-center gap-3.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-xs font-black text-white">
                      01
                    </span>
                    <div>
                      <p className="text-xs font-black uppercase text-white">CHALLENGER</p>
                      <p className="text-[11px] text-white/50">Dès la 1ère séance validée</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold text-white/80">
                    Niveau Débutant
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-lime-400/40 bg-lime-400/10 p-4 transition hover:scale-[1.02]">
                  <div className="flex items-center gap-3.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime-400 text-xs font-black text-black">
                      02
                    </span>
                    <div>
                      <p className="text-xs font-black uppercase text-lime-400">MACHINE</p>
                      <p className="text-[11px] text-white/70">12 séances par mois + défis relevés</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-lime-400 px-3 py-1 text-[10px] font-black text-black">
                    Avantages Débloqués
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-yellow-400/40 bg-yellow-400/5 p-4 transition hover:border-yellow-400/60">
                  <div className="flex items-center gap-3.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-400 text-xs font-black text-black">
                      03
                    </span>
                    <div>
                      <p className="text-xs font-black uppercase text-yellow-300">G.O.A.T</p>
                      <p className="text-[11px] text-white/50">Légende du club • Réductions VIP</p>
                    </div>
                  </div>
                  <span className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-[10px] font-bold text-yellow-300">
                    Statut Ultime
                  </span>
                </div>
              </div>

              {/* Monthly Challenge Teaser */}
              <div className="mt-8 rounded-2xl border border-dashed border-lime-400/30 bg-lime-400/[0.03] p-4 text-center">
                <p className="text-[11px] font-bold uppercase tracking-wider text-lime-400">
                  Challenge du mois : 10 séances en 30 jours
                </p>
                <p className="mt-1 text-xs text-white/60">
                  Gagne ton shaker collector et 1 mois d&apos;option Yanga offert !
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Fitness Park exact text and value proposition */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-lime-400/30 bg-lime-400/10 px-4 py-1 text-xs font-black uppercase tracking-wider text-lime-400">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />
              <span>Programme de Fidélité Inclus</span>
            </div>

            <h2 className="mt-5 text-4xl font-black uppercase tracking-tight text-white sm:text-5xl md:text-6xl">
              PROGRAMME DE FIDÉLITÉ
              <br />
              <span className="text-lime-400">LEVEL UP</span>
            </h2>

            <p className="mt-6 text-lg font-medium leading-relaxed text-white/80">
              C&apos;est le programme de fidélité Samba Fitness, le principe est simple : plus tu t&apos;entraînes, plus tu level up, et plus tu level up, plus tu as d&apos;avantages exclusifs dans tous nos clubs.
            </p>

            {/* 3 Pillars matching Fitness Park */}
            <div className="mt-8 space-y-6">
              <div className="flex items-start gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-lime-400 text-black">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <div>
                  <h4 className="text-base font-black uppercase text-white">
                    3 LEVELS : CHALLENGER, MACHINE & G.O.A.T
                  </h4>
                  <p className="mt-1 text-sm text-white/60">
                    Passe les paliers en scannant ton badge à chaque séance dans l&apos;un de nos clubs.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-lime-400 text-black">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <div>
                  <h4 className="text-base font-black uppercase text-white">
                    CHALLENGES & RÉCOMPENSES DISPONIBLES CHAQUE MOIS
                  </h4>
                  <p className="mt-1 text-sm text-white/60">
                    Participe aux défis communautaires sur l&apos;application et débloque des cadeaux exclusifs, textiles et réductions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-lime-400 text-black">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <div>
                  <h4 className="text-base font-black uppercase text-white">
                    100% GRATUIT ET INCLUS DANS TOUS LES ABONNEMENTS
                  </h4>
                  <p className="mt-1 text-sm text-white/60">
                    Aucune démarche complexe : ton profil est automatiquement activé dès ton inscription.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="#essai-gratuit"
                className="rounded-full bg-lime-400 px-8 py-4 text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-lime-400/25 transition duration-200 hover:scale-105 hover:bg-lime-300"
              >
                Rejoindre Samba Fitness
              </a>
              <a
                href="#tarifs"
                className="rounded-full border border-white/20 bg-white/5 px-8 py-4 text-xs font-black uppercase tracking-wider text-white transition hover:border-lime-400 hover:text-lime-400"
              >
                Voir nos formules d&apos;abonnement
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
