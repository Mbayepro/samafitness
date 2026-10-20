"use client";

import type { FormEvent } from "react";
import Image from "next/image";
import type { SiteContentType } from "@/lib/content-store";

interface CoachEditorTabProps {
  content: SiteContentType;
  isPending: boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

export default function CoachEditorTab({ content, isPending, onSubmit }: CoachEditorTabProps) {
  return (
    <div className="mt-8 max-w-3xl">
      {content.coaches[0] && (
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-[#121212] p-8">
            <h3 className="text-lg font-black uppercase text-white">Profil du Coach Fondateur</h3>
            <p className="mt-1 text-xs text-white/50">
              Modifiez la photo, le titre, la biographie et les spécialités de Samba Diop.
            </p>

            <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
              {/* Photo Preview */}
              <div className="flex flex-col items-center">
                <div className="relative h-44 w-36 overflow-hidden rounded-2xl border border-white/15 bg-black">
                  {content.coaches[0].imageUrl ? (
                    <Image
                      src={content.coaches[0].imageUrl}
                      alt={content.coaches[0].name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-white/40">
                      Pas de photo
                    </div>
                  )}
                </div>
                <span className="mt-2 text-[10px] text-white/40">Aperçu photo</span>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
                    Nom complet
                  </label>
                  <input
                    name="coachName"
                    defaultValue={content.coaches[0].name}
                    required
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-xs text-white focus:border-lime-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
                      Rôle / Titre
                    </label>
                    <input
                      name="coachRole"
                      defaultValue={content.coaches[0].role}
                      required
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-xs text-lime-400 font-bold focus:border-lime-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
                      Badge expérience
                    </label>
                    <input
                      name="coachExperience"
                      defaultValue={content.coaches[0].experience}
                      required
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-xs text-white focus:border-lime-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
                    URL de la photo
                  </label>
                  <input
                    name="coachImageUrl"
                    defaultValue={content.coaches[0].imageUrl}
                    placeholder="https://images.unsplash.com/... ou lien direct vers la photo"
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-xs text-white focus:border-lime-400 focus:outline-none"
                  />
                  <p className="mt-1 text-[11px] text-white/40">
                    Pour mettre une vraie photo de Samba Diop, vous pouvez héberger son image sur Supabase Storage ou coller son lien direct.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
                    Spécialités (séparées par des virgules)
                  </label>
                  <input
                    name="coachSpecialties"
                    defaultValue={content.coaches[0].specialties.join(", ")}
                    placeholder="Musculation, Cross-training, Remise en forme"
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-xs text-white focus:border-lime-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
                    Biographie / Présentation
                  </label>
                  <textarea
                    name="coachBio"
                    rows={4}
                    defaultValue={content.coaches[0].bio}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-xs text-white leading-relaxed focus:border-lime-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-lime-400 px-8 py-3.5 text-xs font-black uppercase tracking-wider text-black hover:bg-lime-300 transition shadow-lg shadow-lime-400/20 disabled:opacity-50"
            >
              {isPending ? "Enregistrement..." : "Enregistrer le profil du coach"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
