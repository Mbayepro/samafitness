"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useSiteData } from "@/lib/site-context";

export default function Coachs() {
  const SITE_DATA = useSiteData();
  return (
    <section id="coachs" className="border-t border-white/10 bg-[#090909] px-6 py-28">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-lime-400">
            Ton accompagnement
          </p>
          <h2 className="mt-4 font-sport text-4xl uppercase tracking-wider text-white md:text-6xl">
            Notre coach
          </h2>
          <p className="mt-6 text-base leading-relaxed text-white/60">
            À {SITE_DATA.brand.name}, on t&apos;aide à bien démarrer, à corriger tes mouvements
            et à rester motivé jusqu&apos;à ton objectif.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {SITE_DATA.coaches.map((coach, index) => (
            <motion.article
              key={coach.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] transition-all duration-300 hover:border-lime-400/50 hover:bg-white/[0.05]"
            >
              {/* Coach Photo */}
              <div className="relative h-72 w-full overflow-hidden bg-black/50">
                <Image
                  src={coach.imageUrl}
                  alt={coach.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-108"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                <div className="absolute bottom-3 left-4">
                  <span className="rounded-full bg-lime-400/90 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-black backdrop-blur-md">
                    {coach.experience}
                  </span>
                </div>
              </div>

              {/* Coach Details */}
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-xl font-black text-white group-hover:text-lime-300 transition-colors">
                  {coach.name}
                </h3>
                <p className="mt-1 text-xs font-semibold text-lime-400">
                  {coach.role}
                </p>

                <p className="mt-4 text-xs leading-relaxed text-white/55">
                  {coach.bio}
                </p>

                {/* Specialties */}
                <div className="mt-5 flex-1 border-t border-white/10 pt-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                    Spécialités
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {coach.specialties.map((spec) => (
                      <span
                        key={spec}
                        className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-medium text-white/80 transition-colors hover:border-lime-400/40 hover:text-white"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom CTA */}
                <div className="mt-6 pt-2">
                  <a
                    href="#rejoindre"
                    className="block w-full rounded-xl border border-white/15 py-2.5 text-center text-xs font-bold text-white transition hover:border-lime-400 hover:bg-lime-400 hover:text-black"
                  >
                    S&apos;entraîner avec {coach.name.split(" ")[0]}
                  </a>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
