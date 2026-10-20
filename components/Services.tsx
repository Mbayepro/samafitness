"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { useSiteData } from "@/lib/site-context";

export default function Services() {
  const SITE_DATA = useSiteData();
  const [activeCategory, setActiveCategory] = useState("Tous");

  const categories = [
    "Tous",
    "Force",
    "Cardio",
    "Hybride",
    "Combat",
    "Collectif",
  ];

  const filteredServices =
    activeCategory === "Tous"
      ? SITE_DATA.services
      : SITE_DATA.services.filter((s) => s.category === activeCategory);

  return (
    <section id="services" className="relative mx-auto max-w-7xl px-6 py-28">
      {/* Background radial glow */}
      <div className="pointer-events-none absolute left-0 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-lime-400/5 blur-[150px]" />

      {/* Fitness Park Signature "parag--spaces" Header */}
      <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-lime-400/30 bg-lime-400/10 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-lime-400">
            <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />
            <span>Tous nos services à la salle</span>
          </div>

          <h2 className="mt-4 font-sport text-5xl uppercase tracking-wider text-white sm:text-6xl md:text-7xl">
            NOS SERVICES
          </h2>

          <p className="mt-4 text-base font-normal leading-relaxed text-white/70 sm:text-lg">
            Musculation, cardio, cross-training, boxe et cours collectifs : découvrez tous nos services à Ndioum pour vous dépasser, perdre du poids ou prendre du muscle.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex items-center gap-3"
        >
          <a
            href="#rejoindre"
            className="inline-flex rounded-full bg-lime-400 px-7 py-3.5 text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-lime-400/20 transition hover:scale-105 hover:bg-lime-300"
          >
            Rejoindre SAMBAFITNESS →
          </a>
        </motion.div>
      </div>

      {/* Interactive Category Filter Pills */}
      <div className="mt-12 flex flex-wrap items-center gap-2 border-b border-white/10 pb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`relative rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-wider transition ${
              activeCategory === cat
                ? "bg-lime-400 text-black shadow-md shadow-lime-400/20"
                : "border border-white/10 bg-white/5 text-white/70 hover:border-lime-400/40 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* High-Impact Spaces Grid with Framer Motion Stagger */}
      <motion.div
        layout
        className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence>
          {filteredServices.map((service, index) => (
            <motion.article
              layout
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              whileHover={{ y: -8 }}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/15 bg-[#0f0f0f] transition-colors duration-300 hover:border-lime-400/60 hover:shadow-2xl hover:shadow-lime-400/10"
            >
              <div>
                {/* Image Container with athletic styling */}
                <div className="relative h-64 w-full overflow-hidden bg-black">
                  {service.imageUrl && (
                    <Image
                      src={service.imageUrl}
                      alt={service.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-black/40 to-transparent" />

                  {/* Badges on image */}
                  <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-lime-400/40 bg-black/85 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-lime-400 backdrop-blur-md">
                      {service.tag || "Inclus"}
                    </span>
                    {service.category && (
                      <span className="rounded-full border border-white/15 bg-black/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/80 backdrop-blur-md">
                        {service.category}
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-4 right-4 font-mono text-xs font-black text-lime-400/80">
                    0{index + 1}
                  </div>
                </div>

                {/* Text Info */}
                <div className="p-7">
                  <h3 className="text-2xl font-black uppercase tracking-tight text-white transition-colors group-hover:text-lime-300">
                    {service.title}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-white/70">
                    {service.description}
                  </p>

                  {/* Highlights checkmarks */}
                  <ul className="mt-6 space-y-2.5 border-t border-white/10 pt-5">
                    {service.highlights.map((item) => (
                      <li key={item} className="flex items-center gap-2.5 text-xs text-white/80">
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-lime-400/20 text-lime-400">
                          <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom action link */}
              <div className="px-7 pb-7 pt-2">
                <a
                  href="#rejoindre"
                  className="inline-flex w-full items-center justify-between rounded-2xl border border-white/15 bg-white/[0.03] px-5 py-3.5 text-xs font-black uppercase tracking-wider text-white transition-all group-hover:border-lime-400 group-hover:bg-lime-400 group-hover:text-black"
                >
                  <span>Rejoindre ce service</span>
                  <span className="text-base transition-transform group-hover:translate-x-1">→</span>
                </a>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
