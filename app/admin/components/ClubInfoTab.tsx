"use client";

import type { FormEvent } from "react";
import type { SiteContentType } from "@/lib/content-store";

interface ClubInfoTabProps {
  content: SiteContentType;
  isPending: boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onResetDefaults: () => void;
}

export default function ClubInfoTab({ content, isPending, onSubmit, onResetDefaults }: ClubInfoTabProps) {
  return (
<div className="mt-8">
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-[#121212] p-8">
          <h3 className="text-lg font-black uppercase text-white">Identité de l&apos;établissement</h3>
          <p className="mt-1 text-xs text-white/50">
            Ces informations apparaissent dans l&apos;en-tête, le Hero et le pied de page du site.
          </p>

          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
                Nom complet
              </label>
              <input
                name="brandName"
                defaultValue={content.brand.name}
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-xs text-white focus:border-lime-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
                Préfixe (Ex: SAMBA)
              </label>
              <input
                name="shortName"
                defaultValue={content.brand.shortName}
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-xs text-white focus:border-lime-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
                Suffixe coloré (Ex: FITNESS)
              </label>
              <input
                name="accentName"
                defaultValue={content.brand.accentName}
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-xs text-lime-400 font-bold focus:border-lime-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
                Slogan
              </label>
              <input
                name="slogan"
                defaultValue={content.brand.slogan}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-xs text-white focus:border-lime-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
                Sous-titre d&apos;accueil
              </label>
              <input
                name="subSlogan"
                defaultValue={content.brand.subSlogan}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-xs text-white focus:border-lime-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
              Description du club
            </label>
            <textarea
              name="description"
              rows={3}
              defaultValue={content.brand.description}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-xs text-white focus:border-lime-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Coordonnées & Horaires */}
        <div className="rounded-3xl border border-white/10 bg-[#121212] p-8">
          <h3 className="text-lg font-black uppercase text-white">Coordonnées & Horaires</h3>
          <p className="mt-1 text-xs text-white/50">
            Numéros de contact pour les appels directs, WhatsApp et l&apos;adresse de la salle.
          </p>

          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
                Téléphone affiché
              </label>
              <input
                name="phone"
                defaultValue={content.contact.phone}
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-xs text-white font-mono focus:border-lime-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
                Numéro WhatsApp (avec indicatif pays, sans +)
              </label>
              <input
                name="whatsapp"
                defaultValue={content.contact.whatsapp.number}
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-xs text-white font-mono focus:border-lime-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
                Email de contact
              </label>
              <input
                name="email"
                type="email"
                defaultValue={content.contact.email}
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-xs text-white focus:border-lime-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
                Adresse complète
              </label>
              <input
                name="address"
                defaultValue={content.contact.address}
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-xs text-white focus:border-lime-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
                Ville
              </label>
              <input
                name="city"
                defaultValue={content.contact.city}
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-xs text-white focus:border-lime-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
              Horaires d&apos;ouverture affichés
            </label>
            <input
              name="hoursText"
              defaultValue={content.contact.hoursText || "Horaires : appelez-nous"}
              required
              placeholder="Ex: Horaires : appelez-nous ou Lun-Sam 6h-22h"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-xs text-white focus:border-lime-400 focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-white/40">
              Ce texte s&apos;affiche sur la carte, dans le pied de page et les informations d&apos;accès.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onResetDefaults}
            className="rounded-full border border-red-500/20 bg-red-500/5 px-6 py-3 text-xs font-bold text-red-400 hover:bg-red-500 hover:text-white transition"
          >
            ↺ Rétablir les valeurs par défaut
          </button>

          <button
            type="submit"
            disabled={isPending}
            className="rounded-full bg-lime-400 px-8 py-3.5 text-xs font-black uppercase tracking-wider text-black hover:bg-lime-300 transition shadow-lg shadow-lime-400/20 disabled:opacity-50"
          >
            {isPending ? "Enregistrement en cours..." : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
    </div>
  );
}
