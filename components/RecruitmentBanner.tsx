"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Briefcase, ArrowRight, Calendar, Users, Dumbbell, Sparkles } from "lucide-react";

export default function RecruitmentBanner() {
  const positions = [
    { label: "Coach Sportif", icon: Dumbbell },
    { label: "Gestionnaire", icon: Briefcase },
    { label: "Secrétaire / Accueil", icon: Users },
    { label: "Femme de Ménage", icon: Sparkles },
  ];

  return (
    <section aria-label="Campagne de Recrutement" className="relative border-y border-amber-400/30 bg-[#0a0a0c] px-6 py-14">
      {/* Halo lumineux */}
      <div className="pointer-events-none absolute right-10 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-amber-400/5 blur-[120px]" />
      <div className="pointer-events-none absolute left-10 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-lime-400/5 blur-[120px]" />

      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-8 rounded-3xl border border-white/10 bg-gradient-to-r from-[#141416] via-black to-[#121411] p-6 sm:p-10 lg:flex-row lg:items-center lg:justify-between"
        >
          {/* Texte & Postes */}
          <div className="max-w-2xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-amber-300">
                <Calendar size={13} />
                <span>Candidatures ouvertes : 1 au 20 Nov. 2026</span>
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-bold text-white/70">
                Ndioum, Sénégal
              </span>
            </div>

            <h2 className="font-sport text-3xl uppercase tracking-wider text-white sm:text-4xl lg:text-5xl">
              REJOIGNEZ L&apos;ÉQUIPE DE SAMBA FITNESS
            </h2>

            <p className="text-sm leading-relaxed text-white/70 sm:text-base">
              La salle de sport de Ndioum lance un recrutement officiel. 4 postes sont à pourvoir immédiatement pour bâtir une équipe dynamique et passionnée.
            </p>

            {/* Badges des 4 postes */}
            <div className="flex flex-wrap gap-2 pt-2">
              {positions.map((p) => {
                const Icon = p.icon;
                return (
                  <span
                    key={p.label}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/90"
                  >
                    <Icon size={14} className="text-lime-400" />
                    <span>{p.label}</span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* CTA vers le formulaire */}
          <div className="flex flex-col items-start gap-3 lg:items-end shrink-0">
            <Link
              href="/recrutement"
              className="inline-flex items-center gap-3 rounded-full bg-lime-400 px-8 py-4 text-xs font-black uppercase tracking-wider text-black shadow-xl shadow-lime-400/20 transition hover:bg-lime-300 hover:scale-105"
            >
              <span>Postuler en ligne</span>
              <ArrowRight size={16} />
            </Link>
            <p className="text-[11px] text-white/40">
              Formulaire officiel • Dépôt de CV en ligne
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

