"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useSiteData } from "@/lib/site-context";

export default function Hero() {
  const SITE_DATA = useSiteData();
  const salle = SITE_DATA.salles[0];

  // Motion variants for word-by-word title stagger
  const titleWords = ["SALLE", "DE", "SPORT"];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
      },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <section
      id="accueil"
      className="relative flex min-h-[95vh] flex-col justify-center overflow-hidden pt-28 pb-16 md:min-h-screen md:pt-36 md:pb-24"
    >
      {/* Background Image with Slow Ken Burns effect */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: 1.08 }}
          transition={{
            duration: 16,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
          className="relative h-full w-full"
        >
          <Image
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=2200&q=90"
            alt={`${SITE_DATA.brand.name} - Salle de sport`}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </motion.div>

        {/* Dynamic athletic overlays : image bien visible et texte parfaitement contrasté */}
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-black/30" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6">
        <div className="max-w-4xl">
          {/* Promotional pill */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-lime-400/40 bg-lime-400/10 px-4 py-1.5 backdrop-blur-md"
          >
            <span className="h-2 w-2 rounded-full bg-lime-400 animate-ping" />
            <p className="text-xs font-black uppercase tracking-[0.2em] text-lime-400">
              SALLE DE SPORT • NDIOUM, SÉNÉGAL
            </p>
          </motion.div>

          {/* Staggered Word-by-Word Headline */}
          <motion.h1
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="font-sport mt-6 text-6xl uppercase leading-[0.9] tracking-wider text-white sm:text-8xl md:text-9xl"
          >
            {titleWords.map((word, i) => (
              <motion.span
                key={i}
                variants={wordVariants}
                className="inline-block mr-3"
              >
                {word}
              </motion.span>
            ))}
            <br />
            <motion.span variants={wordVariants} className="inline-block text-white mr-3">
              À
            </motion.span>
            <motion.span
              variants={wordVariants}
              className="inline-block rounded-xl bg-lime-400 px-4 py-1 text-black drop-shadow-[0_0_40px_rgba(163,230,53,0.5)] transform -rotate-1"
            >
              NDIOUM
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-7 max-w-2xl text-lg font-medium leading-relaxed text-white/80 sm:text-xl md:text-2xl"
          >
            Musculation, cardio, cross-training, boxe et cours collectifs. Sur la route nationale, en face de la mairie.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <a
              href="#tarifs"
              className="rounded-full bg-lime-400 px-8 py-4 text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-lime-400/25 transition duration-200 hover:scale-105 hover:bg-lime-300"
            >
              Découvrir les formules
            </a>

            <a
              href="#salles"
              className="rounded-full border border-white/25 bg-white/5 px-8 py-4 text-xs font-black uppercase tracking-wider text-white backdrop-blur-md transition duration-200 hover:border-lime-400 hover:bg-white/10 hover:text-lime-400"
            >
              Nous trouver
            </a>

            {/* Pulsing "Rejoindre le club" button */}
            <a
              href="#rejoindre"
              className="relative inline-flex items-center gap-2 rounded-full border border-lime-400 bg-lime-400/15 px-7 py-4 text-xs font-black uppercase tracking-wider text-lime-400 transition hover:bg-lime-400 hover:text-black shadow-[0_0_20px_rgba(163,230,53,0.25)] group"
            >
              <span className="absolute -inset-0.5 rounded-full bg-lime-400/30 animate-pulse pointer-events-none" />
              <span className="relative">Rejoindre le club</span>
              <span className="relative transition-transform duration-200 group-hover:translate-x-1">→</span>
            </a>
          </motion.div>

          {/* Location & quick contact bar */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.85 }}
            className="mt-12 rounded-3xl border border-white/15 bg-black/60 p-5 backdrop-blur-xl shadow-2xl sm:p-6"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-lime-400">
                  <span className="h-2 w-2 rounded-full bg-lime-400" />
                  <span>{salle.name}</span>
                </p>
                <p className="mt-1 text-sm text-white/80">
                  {salle.address}, {salle.city}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  id="hero-call-btn"
                  href={`tel:${SITE_DATA.contact.phoneTel}`}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white transition hover:border-lime-400 hover:bg-lime-400/10 hover:text-lime-400"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />
                  <span>{SITE_DATA.contact.phone}</span>
                </a>
                <a
                  id="hero-whatsapp-btn"
                  href={`https://wa.me/${SITE_DATA.contact.whatsapp.number}?text=${encodeURIComponent(
                    SITE_DATA.contact.whatsapp.defaultMessage
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-emerald-500/35 bg-emerald-500/15 px-4 py-2 text-xs font-black uppercase text-emerald-300 hover:bg-emerald-400 hover:text-black transition"
                >
                  WhatsApp ↗
                </a>
                <a
                  id="hero-maps-btn"
                  href={salle.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-lime-400/30 bg-lime-400/10 px-4 py-2 text-xs font-black uppercase text-lime-400 hover:bg-lime-400 hover:text-black transition"
                >
                  Itinéraire ↗
                </a>
              </div>
            </div>
          </motion.div>

          {/* Reassurance Checkmarks */}
          <div className="mt-10 grid grid-cols-2 gap-4 border-t border-white/10 pt-8 sm:grid-cols-4 text-xs font-semibold text-white/75">
            <div className="flex items-center gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime-400/20 text-lime-400">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span>Face à la mairie de Ndioum</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime-400/20 text-lime-400">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span>Inscription simple & rapide</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime-400/20 text-lime-400">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span>Musculation & cardio</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime-400/20 text-lime-400">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span>Boxe & cours collectifs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Scroll Down Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 hidden md:flex flex-col items-center gap-1.5 pointer-events-none"
      >
        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
          Défiler
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-7 w-4.5 rounded-full border border-white/20 items-start justify-center p-1"
        >
          <span className="h-1.5 w-1 rounded-full bg-lime-400" />
        </motion.div>
      </motion.div>
    </section>
  );
}
