"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, Sparkles, Check, Plus, MessageCircle } from "lucide-react";
import { useSiteData } from "@/lib/site-context";

export default function Boutique() {
  const SITE_DATA = useSiteData();
  const shop = SITE_DATA.shop;
  const [activeCategory, setActiveCategory] = useState<string>("Tous");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  if (!shop || !shop.enabled) {
    return null;
  }

  const categories = [
    "Tous",
    "Protéines & Nutrition",
    "Serviettes & Accessoires",
    "Boissons & Énergie",
  ];

  const items = shop.items || [];
  const filteredItems =
    activeCategory === "Tous"
      ? items
      : items.filter((item) => item.category === activeCategory);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedProducts = items.filter((item) => selectedIds.includes(item.id));

  const buildWhatsAppUrl = (productNames: string[]) => {
    const listText = productNames.map((n) => `• ${n}`).join("\n");
    const message =
      `Bonjour ${SITE_DATA.brand.name} Ndioum !\n\n` +
      `Je souhaite connaître la disponibilité / pré-réserver côté Boutique :\n` +
      `${listText}\n\n` +
      `Merci de me tenir informé(e) !`;
    return `https://wa.me/${SITE_DATA.contact.whatsapp.number}?text=${encodeURIComponent(
      message
    )}`;
  };

  return (
    <section
      id="boutique"
      className="relative overflow-hidden border-t border-white/10 bg-[#070707] px-6 py-28"
    >
      {/* Halo ambiant Ambre + Lime */}
      <div className="pointer-events-none absolute right-0 top-1/4 h-[480px] w-[480px] translate-x-1/3 rounded-full bg-amber-400/5 blur-[150px]" />
      <div className="pointer-events-none absolute left-0 bottom-10 h-[380px] w-[380px] -translate-x-1/3 rounded-full bg-lime-400/5 blur-[140px]" />

      <div className="relative mx-auto max-w-7xl">
        {/* En-tête de section */}
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/35 bg-amber-400/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-amber-300">
              <Sparkles size={13} className="text-amber-400" />
              <span>{shop.badgeText || "Samba Shop • Nutrition & Équipements"}</span>
            </div>

            <h2 className="mt-4 font-sport text-5xl uppercase tracking-wider text-white sm:text-6xl md:text-7xl">
              {shop.title || "NUTRITION & ÉQUIPEMENTS"}
            </h2>

            <p className="mt-4 text-base font-normal leading-relaxed text-white/70 sm:text-lg">
              {shop.subtitle}
            </p>
          </motion.div>

          {/* Encart explicatif "Sans paiement en ligne / Retrait à la salle" */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-md"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-300 border border-amber-400/30">
              <ShoppingBag size={20} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-white">
                Retrait & Conseil à l&apos;accueil
              </p>
              <p className="mt-0.5 text-xs text-white/60">
                Demandez la disponibilité ou pré-réservez en 1 clic sur WhatsApp
              </p>
            </div>
          </motion.div>
        </div>

        {/* Filtres par famille */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-wider transition ${
                    isActive
                      ? "bg-amber-400 text-black shadow-md shadow-amber-400/20"
                      : "border border-white/10 bg-white/5 text-white/70 hover:border-amber-400/40 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <p className="text-xs font-medium text-white/45">
            Sélectionnez un ou plusieurs articles pour envoyer votre demande groupée
          </p>
        </div>

        {/* Grille Produits */}
        <motion.div
          layout
          className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence>
            {filteredItems.map((item, index) => {
              const isSelected = selectedIds.includes(item.id);
              const singleWhatsappUrl = buildWhatsAppUrl([item.name]);

              return (
                <motion.article
                  layout
                  key={item.id}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  whileHover={{ y: -6 }}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl transition-all duration-300 ${
                    isSelected
                      ? "border-2 border-amber-400 bg-gradient-to-b from-[#171510] to-[#0c0c0c] shadow-2xl shadow-amber-400/15"
                      : item.featured
                      ? "border border-amber-400/45 bg-gradient-to-b from-[#141414] to-[#0b0b0b] hover:border-amber-400"
                      : "border border-white/15 bg-[#101010] hover:border-amber-400/50"
                  }`}
                >
                  <div>
                    {/* Visuel du produit */}
                    <div className="relative h-60 w-full overflow-hidden bg-black">
                      {item.imageUrl && (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#101010] via-black/45 to-transparent" />

                      {/* Badges haut */}
                      <div className="absolute left-4 right-4 top-4 flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/50 bg-black/85 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-amber-300 backdrop-blur-md">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                          <span>{item.statusBadge}</span>
                        </span>

                        <span className="rounded-full border border-white/15 bg-black/75 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/80 backdrop-blur-md">
                          {item.goalTag}
                        </span>
                      </div>

                      {/* Indicateur de prix / sur demande en bas de l'image */}
                      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                        <span className="rounded-xl border border-white/10 bg-black/80 px-3 py-1 text-xs font-black text-lime-400 backdrop-blur-md">
                          {item.priceNote || "Tarif sur demande"}
                        </span>
                      </div>
                    </div>

                    {/* Contenu texte */}
                    <div className="p-7">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/80">
                        {item.category}
                      </p>
                      <h3 className="mt-1 text-2xl font-black uppercase tracking-tight text-white transition-colors group-hover:text-amber-300">
                        {item.name}
                      </h3>

                      <p className="mt-3 text-sm leading-relaxed text-white/70">
                        {item.description}
                      </p>

                      {item.highlights && item.highlights.length > 0 && (
                        <ul className="mt-5 space-y-2 border-t border-white/10 pt-4">
                          {item.highlights.map((pt) => (
                            <li
                              key={pt}
                              className="flex items-center gap-2.5 text-xs text-white/80"
                            >
                              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-amber-300">
                                <Check size={10} strokeWidth={3} />
                              </span>
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Actions bas de carte */}
                  <div className="grid grid-cols-2 gap-2.5 px-7 pb-7 pt-2">
                    <button
                      type="button"
                      onClick={() => toggleSelect(item.id)}
                      className={`flex items-center justify-center gap-1.5 rounded-2xl px-3 py-3 text-xs font-black uppercase tracking-wider transition ${
                        isSelected
                          ? "bg-amber-400 text-black shadow-lg shadow-amber-400/20"
                          : "border border-white/15 bg-white/5 text-white hover:border-amber-400/50 hover:text-amber-300"
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check size={14} strokeWidth={2.5} />
                          <span>Sélectionné</span>
                        </>
                      ) : (
                        <>
                          <Plus size={14} strokeWidth={2.5} />
                          <span>Sélectionner</span>
                        </>
                      )}
                    </button>

                    <a
                      href={singleWhatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 rounded-2xl border border-lime-400/40 bg-lime-400/15 px-3 py-3 text-xs font-black uppercase tracking-wider text-lime-300 transition hover:bg-lime-400 hover:text-black"
                    >
                      <MessageCircle size={14} />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Barre flottante / récapitulative si l'utilisateur a sélectionné des produits */}
        <AnimatePresence>
          {selectedProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-10 flex flex-col items-center justify-between gap-4 rounded-3xl border-2 border-amber-400/60 bg-gradient-to-r from-[#18150d] via-[#121212] to-[#10180b] p-5 shadow-2xl sm:flex-row sm:px-7"
            >
              <div className="flex items-center gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-400 font-mono text-sm font-black text-black">
                  {selectedProducts.length}
                </span>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-amber-300">
                    Votre sélection Samba Shop
                  </p>
                  <p className="text-xs text-white/80">
                    {selectedProducts.map((p) => p.name).join(" • ")}
                  </p>
                </div>
              </div>

              <div className="flex w-full sm:w-auto items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-3 text-xs font-bold text-white/70 hover:bg-white/10 hover:text-white transition"
                >
                  Effacer
                </button>
                <a
                  href={buildWhatsAppUrl(selectedProducts.map((p) => p.name))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-full bg-lime-400 px-6 py-3 text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-lime-400/25 hover:bg-lime-300 transition"
                >
                  <MessageCircle size={15} />
                  <span>Demander la disponibilité sur WhatsApp →</span>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

