"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useSiteData } from "@/lib/site-context";

export default function Salles() {
  const SITE_DATA = useSiteData();
  const salle = SITE_DATA.salles[0];
  const { contact } = SITE_DATA;
  const whatsappUrl = `https://wa.me/${contact.whatsapp.number}?text=${encodeURIComponent(
    contact.whatsapp.defaultMessage
  )}`;

  return (
    <section id="salles" className="border-t border-white/10 bg-[#090909] px-6 py-28">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-lime-400/30 bg-lime-400/10 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-lime-400">
              <span>{contact.mainCity}</span>
            </div>

            <h2 className="mt-4 font-sport text-5xl uppercase tracking-wider text-white sm:text-6xl md:text-7xl">
              NOUS TROUVER
            </h2>

            <p className="mt-4 text-base font-normal leading-relaxed text-white/70 sm:text-lg">
              La salle est sur la route nationale à Ndioum, juste en face de la mairie. Facile à trouver, passe nous voir !
            </p>
          </motion.div>

          <a
            href="#rejoindre"
            className="inline-flex self-start rounded-full bg-lime-400 px-7 py-3.5 text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-lime-400/20 transition hover:scale-105 hover:bg-lime-300 md:self-auto"
          >
            Rejoindre la salle →
          </a>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {/* Club card */}
          <motion.article
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="group flex flex-col overflow-hidden rounded-3xl border border-white/15 bg-[#121212] transition-all duration-300 hover:border-lime-400/60 hover:shadow-2xl hover:shadow-lime-400/10"
          >
            <div className="relative h-64 w-full overflow-hidden bg-black">
              <Image
                src={salle.imageUrl}
                alt={salle.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-black/40 to-transparent" />

              {salle.badge && (
                <div className="absolute left-4 top-4">
                  <span className="rounded-full border border-lime-400/40 bg-black/85 px-3 py-1 text-xs font-black uppercase tracking-widest text-lime-400 backdrop-blur-md">
                    {salle.badge}
                  </span>
                </div>
              )}

              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-xs font-bold uppercase tracking-widest text-lime-400">
                  {salle.city} • {contact.country}
                </p>
                <h3 className="font-sport text-2xl uppercase tracking-wide text-white transition-colors group-hover:text-lime-300 sm:text-3xl">
                  {salle.name}
                </h3>
              </div>
            </div>

            <div className="flex flex-1 flex-col p-7">
              <p className="text-sm font-medium text-white/80">
                {salle.address}, {salle.city}
              </p>
              <a
                id="salle-maps-link"
                href={salle.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-lime-400 hover:underline"
              >
                <span>Ouvrir l&apos;itinéraire dans Google Maps</span>
                <span className="text-[10px]">↗</span>
              </a>

              <div className="my-5 h-px bg-white/10" />

              {/* Hours */}
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-lime-400 animate-pulse" />
                  <p className="text-xs font-black text-white">{contact.hoursText}</p>
                </div>
                <a
                  href={`tel:${contact.phoneTel}`}
                  className="font-mono text-xs font-bold text-lime-400 hover:underline"
                >
                  {contact.phone}
                </a>
              </div>

              {/* Amenities */}
              <div className="mt-6 flex-1">
                <p className="text-xs font-black uppercase tracking-widest text-white/50">
                  Services disponibles
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {salle.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white/80"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <a
                  id="salle-call-btn"
                  href={`tel:${contact.phoneTel}`}
                  className="block rounded-2xl border border-lime-400/40 bg-lime-400/10 py-3.5 text-center text-xs font-black uppercase tracking-wider text-lime-400 transition hover:bg-lime-400 hover:text-black"
                >
                  Appeler
                </a>
                <a
                  id="salle-whatsapp-btn"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-2xl bg-[#25D366] py-3.5 text-center text-xs font-black uppercase tracking-wider text-white transition hover:bg-[#20ba59]"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </motion.article>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="relative min-h-[420px] overflow-hidden rounded-3xl border border-white/15 bg-[#121212]"
          >
            <iframe
              title={`Plan d'accès ${salle.name}`}
              src={salle.mapEmbedUrl}
              className="absolute inset-0 h-full w-full grayscale-[60%] invert-[90%] hue-rotate-180"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <a
              href={salle.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-4 right-4 z-10 flex items-center gap-1.5 rounded-full border border-lime-400/50 bg-black/85 px-3.5 py-1.5 text-xs font-bold text-lime-400 backdrop-blur-md transition hover:bg-lime-400 hover:text-black shadow-lg"
            >
              <span>Ouvrir l&apos;itinéraire ↗</span>
            </a>
            <div className="pointer-events-none absolute bottom-4 left-4 rounded-2xl border border-lime-400/40 bg-black/85 px-4 py-2.5 backdrop-blur-md">
              <p className="text-[10px] font-bold uppercase tracking-widest text-lime-400">Repère</p>
              <p className="text-xs font-black text-white">En face de la mairie de Ndioum</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
