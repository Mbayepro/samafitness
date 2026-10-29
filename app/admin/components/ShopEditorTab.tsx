"use client";

import type { Dispatch, FormEvent, SetStateAction } from "react";
import { ShoppingBag, Eye, EyeOff, Plus, Trash2, X } from "lucide-react";
import type { SiteContentType } from "@/lib/content-store";
import type { ShopProductItem } from "@/lib/site-data";
import { SITE_DATA } from "@/lib/site-data";

interface ShopEditorTabProps {
  content: SiteContentType;
  setContent: Dispatch<SetStateAction<SiteContentType | null>>;
  isPending: boolean;
  onSubmit: (e: FormEvent) => void;
}

export default function ShopEditorTab({
  content,
  setContent,
  isPending,
  onSubmit,
}: ShopEditorTabProps) {
  const shop = content.shop || SITE_DATA.shop;

  const updateShop = (partial: Partial<typeof shop>) => {
    setContent({
      ...content,
      shop: {
        ...shop,
        ...partial,
      },
    });
  };

  const updateItem = (idx: number, partial: Partial<ShopProductItem>) => {
    const items = [...(shop.items || [])];
    items[idx] = { ...items[idx], ...partial };
    updateShop({ items });
  };

  return (
    <div className="mt-6">
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Bandeau d'activation On / Off */}
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-[#121212] p-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/15 text-amber-300">
              <ShoppingBag size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black uppercase text-white">
                  Vitrine Boutique & Nutrition (Samba Shop)
                </h3>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                    shop.enabled
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-white/10 text-white/50 border border-white/10"
                  }`}
                >
                  {shop.enabled ? "Visible sur le site" : "Masquée"}
                </span>
              </div>
              <p className="mt-1 text-xs text-white/55">
                Vous pouvez afficher vos futurs produits sans prix (« Tarif sur demande » / « Bientôt au club ») ou masquer la section tant que vous n&apos;êtes pas prêt.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => updateShop({ enabled: !shop.enabled })}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              shop.enabled
                ? "border border-white/15 bg-white/10 text-white hover:bg-white/15"
                : "bg-amber-400 text-black hover:bg-amber-300"
            }`}
          >
            {shop.enabled ? (
              <>
                <EyeOff size={15} />
                <span>Masquer du site</span>
              </>
            ) : (
              <>
                <Eye size={15} />
                <span>Activer sur le site</span>
              </>
            )}
          </button>
        </div>

        {/* En-tête de la section Boutique */}
        <div className="grid gap-4 rounded-2xl border border-white/10 bg-[#121212] p-5 sm:grid-cols-2">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50">
              Badge d&apos;annonce (ex: Bientôt disponible au club)
            </label>
            <input
              value={shop.badgeText}
              onChange={(e) => updateShop({ badgeText: e.target.value })}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs font-bold text-amber-300 focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50">
              Titre de la section
            </label>
            <input
              value={shop.title}
              onChange={(e) => updateShop({ title: e.target.value })}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs font-bold text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50">
              Sous-titre explicatif
            </label>
            <textarea
              rows={2}
              value={shop.subtitle}
              onChange={(e) => updateShop({ subtitle: e.target.value })}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Barre d'ajout d'un produit / famille */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-black uppercase text-white">
              Produits & Gammes ({shop.items?.length || 0})
            </h4>
            <p className="text-xs text-white/50">
              Laissez « Tarif sur demande » tant que vous n&apos;avez pas fixé les prix en FCFA.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              const newItem: ShopProductItem = {
                id: `shop_${Date.now()}`,
                name: "Nouveau Produit (ex: Gants / Shaker)",
                category: "Serviettes & Accessoires",
                statusBadge: "Bientôt au club",
                priceNote: "Tarif sur demande",
                goalTag: "Équipement Salle",
                description: "Disponible directement à l'accueil de la salle Samba Fitness.",
                highlights: ["Qualité club", "Retrait à l'accueil"],
                imageUrl:
                  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80",
                featured: false,
              };
              updateShop({ items: [...(shop.items || []), newItem] });
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/15 px-4 py-2 text-xs font-black uppercase tracking-wider text-amber-300 hover:bg-amber-400 hover:text-black transition"
          >
            <Plus size={14} />
            <span>Ajouter un article</span>
          </button>
        </div>

        {/* Cartes d'édition des produits */}
        <div className="grid gap-6 lg:grid-cols-3">
          {(shop.items || []).map((item, idx) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#121212] p-5 space-y-4"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <span className="text-[11px] font-black uppercase text-amber-300">
                    Article #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if ((shop.items?.length || 0) <= 1) {
                        alert("Conservez au moins un article (ou masquez la section en haut).");
                        return;
                      }
                      updateShop({
                        items: shop.items.filter((_, i) => i !== idx),
                      });
                    }}
                    className="inline-flex items-center gap-1 text-xs text-red-400 hover:underline"
                  >
                    <Trash2 size={12} />
                    <span>Supprimer</span>
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50">
                    Nom du produit / gamme
                  </label>
                  <input
                    value={item.name}
                    onChange={(e) => updateItem(idx, { name: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs font-bold text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50">
                      Catégorie
                    </label>
                    <select
                      value={item.category}
                      onChange={(e) =>
                        updateItem(idx, {
                          category: e.target.value as ShopProductItem["category"],
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-white/10 bg-black/80 px-2.5 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                    >
                      <option value="Protéines & Nutrition">Protéines & Nutrition</option>
                      <option value="Serviettes & Accessoires">Serviettes & Accessoires</option>
                      <option value="Boissons & Énergie">Boissons & Énergie</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50">
                      Disponibilité
                    </label>
                    <input
                      value={item.statusBadge}
                      placeholder="Bientôt au club / En stock"
                      onChange={(e) => updateItem(idx, { statusBadge: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-amber-300 font-semibold focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50">
                      Prix ou mention
                    </label>
                    <input
                      value={item.priceNote}
                      placeholder="Tarif sur demande / 3 000 FCFA"
                      onChange={(e) => updateItem(idx, { priceNote: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs font-bold text-lime-400 focus:border-lime-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50">
                      Objectif / Tag
                    </label>
                    <input
                      value={item.goalTag}
                      onChange={(e) => updateItem(idx, { goalTag: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={item.description}
                    onChange={(e) => updateItem(idx, { description: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50">
                    Image URL
                  </label>
                  <input
                    value={item.imageUrl}
                    onChange={(e) => updateItem(idx, { imageUrl: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-white/75 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {/* Points forts */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50">
                      Points clés
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        updateItem(idx, {
                          highlights: [...(item.highlights || []), "Nouvel avantage"],
                        })
                      }
                      className="text-[10px] font-bold text-amber-300 hover:underline"
                    >
                      + Ajouter
                    </button>
                  </div>
                  <div className="mt-1.5 space-y-1.5">
                    {(item.highlights || []).map((hl, hIdx) => (
                      <div key={hIdx} className="flex items-center gap-1.5">
                        <input
                          value={hl}
                          onChange={(e) => {
                            const nextHl = [...item.highlights];
                            nextHl[hIdx] = e.target.value;
                            updateItem(idx, { highlights: nextHl });
                          }}
                          className="flex-1 rounded-lg border border-white/10 bg-black/40 px-2.5 py-1 text-xs text-white focus:border-amber-400 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const nextHl = item.highlights.filter((_, i) => i !== hIdx);
                            updateItem(idx, { highlights: nextHl });
                          }}
                          className="flex h-6 w-6 items-center justify-center rounded-md text-white/40 hover:bg-red-500/10 hover:text-red-400"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-full bg-lime-400 px-8 py-3.5 text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-lime-400/20 hover:bg-lime-300 transition disabled:opacity-50"
          >
            {isPending ? "Enregistrement..." : "Enregistrer la Boutique"}
          </button>
        </div>
      </form>
    </div>
  );
}

