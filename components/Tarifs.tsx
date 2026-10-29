"use client";

import { motion } from "motion/react";
import { useSiteData } from "@/lib/site-context";

export default function Tarifs() {
  const SITE_DATA = useSiteData();
  return (
    <section id="tarifs" className="relative border-t border-white/10 bg-[#080808] px-6 py-28">
      <div id="abonnements" className="absolute -top-24" />
      <div className="mx-auto max-w-7xl">
        {/* Fitness Park "parag--subscriptions" Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-lime-400/30 bg-lime-400/10 px-4 py-1 text-xs font-black uppercase tracking-wider text-lime-400">
            <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />
            <span>Formules & Abonnements</span>
          </div>

          <h2 className="mt-4 font-sport text-5xl uppercase tracking-wider text-white sm:text-6xl md:text-7xl">
            NOS FORMULES
          </h2>

          <p className="mt-4 text-base font-normal leading-relaxed text-white/70 sm:text-lg">
            Choisis la formule adaptée à ton objectif. Les tarifs sont communiqués par téléphone, sur WhatsApp ou directement à la salle.
          </p>
        </motion.div>

        {/* Fitness Park 3-Card Formula Cards Grid */}
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {SITE_DATA.plans.map((plan, index) => (
            <motion.article
              key={plan.id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className={`relative flex flex-col justify-between rounded-3xl p-8 transition-all duration-300 sm:p-9 ${
                plan.highlighted
                  ? "border-2 border-lime-400 bg-gradient-to-b from-[#141414] to-[#0a0a0a] shadow-2xl shadow-lime-400/20 animate-glow-card lg:-translate-y-4"
                  : "border border-white/15 bg-[#101010] hover:border-lime-400/40"
              }`}
            >
              {/* Popular / Top Vente Ribbon */}
              {plan.popularBadge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-lime-400 px-4 py-1 text-xs font-black uppercase tracking-widest text-black shadow-lg shadow-lime-400/40">
                    {plan.popularBadge}
                  </span>
                </div>
              )}

              <div>
                {/* Header with status badge */}
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                  <div>
                    {plan.statusBadge && (
                      <span className="text-[11px] font-black uppercase tracking-widest text-lime-400">
                        {plan.statusBadge}
                      </span>
                    )}
                    <h3 className="mt-1 font-sport text-3xl uppercase tracking-wide text-white sm:text-4xl">
                      {plan.name}
                    </h3>
                  </div>

                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 font-mono text-xs font-black text-lime-400">
                    0{index + 1}
                  </span>
                </div>

                {/* Subtitle / Commitment */}
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-lime-400">
                    {plan.statusNote}
                  </p>
                  <p className="mt-1 text-xs text-white/60">
                    {plan.commitment}
                  </p>
                </div>

                <p className="mt-5 text-sm leading-relaxed text-white/70">
                  {plan.description}
                </p>

                {/* Benefits List matching Fitness Park */}
                <ul className="mt-6 space-y-3 border-t border-white/10 pt-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-xs text-white/80">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-lime-400/20 text-lime-400">
                        <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span className="leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-6 border-t border-white/10 space-y-2.5">
                <a
                  href="#rejoindre"
                  className={`block w-full rounded-2xl py-4 text-center text-xs font-black uppercase tracking-wider transition ${
                    plan.highlighted
                      ? "bg-lime-400 text-black shadow-lg shadow-lime-400/25 hover:bg-lime-300 hover:scale-[1.02]"
                      : "border border-white/20 bg-white/5 text-white hover:border-lime-400 hover:bg-lime-400 hover:text-black"
                  }`}
                >
                  {plan.ctaText}
                </a>

                <a
                  href={`https://wa.me/${SITE_DATA.contact.whatsapp.number}?text=${encodeURIComponent(
                    `Bonjour ${SITE_DATA.brand.name}, je souhaite connaître le tarif de la formule « ${plan.name} » à la salle de Ndioum.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 py-3 text-center text-xs font-bold text-emerald-300 transition hover:border-emerald-400 hover:bg-emerald-500/20"
                >
                  <span>Tarif direct sur WhatsApp</span>
                  <span>↗</span>
                </a>

                <p className="mt-2 text-center text-[11px] text-white/50">
                  Tarif par téléphone ou WhatsApp : {SITE_DATA.contact.phone}
                </p>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Fitness Park Reassurance Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16 rounded-3xl border border-white/10 bg-[#0e0e0e] p-8 sm:p-10"
        >
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-center sm:text-left">
            <div>
              <p className="text-2xl font-black text-lime-400">Ndioum</p>
              <h4 className="mt-1 text-sm font-bold uppercase text-white">Facile d&apos;accès</h4>
              <p className="mt-1 text-xs text-white/60">
                Sur la route nationale, en face de la mairie.
              </p>
            </div>

            <div>
              <p className="text-2xl font-black text-lime-400">5 services</p>
              <h4 className="mt-1 text-sm font-bold uppercase text-white">Pour tous les objectifs</h4>
              <p className="mt-1 text-xs text-white/60">
                Musculation, cardio, cross-training, boxe et cours collectifs.
              </p>
            </div>

            <div>
              <p className="text-2xl font-black text-lime-400">WhatsApp</p>
              <h4 className="mt-1 text-sm font-bold uppercase text-white">Contact direct</h4>
              <p className="mt-1 text-xs text-white/60">
                Pose tes questions et demande les tarifs au {SITE_DATA.contact.phone}.
              </p>
            </div>

            <div>
              <p className="text-2xl font-black text-lime-400">Rejoindre</p>
              <h4 className="mt-1 text-sm font-bold uppercase text-white">Inscription simple</h4>
              <p className="mt-1 text-xs text-white/60">
                Inscris-toi rapidement par téléphone, WhatsApp ou directement sur place.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
