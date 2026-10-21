"use client";

import type { Dispatch, FormEvent, SetStateAction } from "react";
import { Star, X } from "lucide-react";
import type { SiteContentType } from "@/lib/content-store";

interface PlansEditorTabProps {
  content: SiteContentType;
  setContent: Dispatch<SetStateAction<SiteContentType | null>>;
  isPending: boolean;
  onSubmit: (e: FormEvent) => void;
}

export default function PlansEditorTab({ content, setContent, isPending, onSubmit }: PlansEditorTabProps) {
  return (
    <div className="mt-8">
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black uppercase text-white">Gestion des Formules</h3>
            <p className="mt-1 text-xs text-white/50">
              Modifiez les noms, descriptions, badges et caractéristiques des abonnements.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              const newPlan = {
                id: `plan_${Date.now()}`,
                name: "Nouvelle Formule",
                statusBadge: "Option",
                statusNote: "Tarif sur demande",
                commitment: "Accès selon formule",
                description: "Description de la nouvelle formule.",
                features: ["Accès aux équipements", "Accompagnement"],
                ctaText: "Demander le tarif",
                highlighted: false,
              };
              setContent({ ...content, plans: [...content.plans, newPlan] });
            }}
            className="rounded-full border border-lime-400/30 bg-lime-400/10 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-lime-400 hover:bg-lime-400 hover:text-black transition"
          >
            + Ajouter une formule
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {content.plans.map((plan, planIdx) => (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-3xl border p-6 bg-[#121212] transition ${
                plan.highlighted ? "border-lime-400 shadow-xl shadow-lime-400/10" : "border-white/10"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-lime-400">
                    Formule #{planIdx + 1}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      if (content.plans.length <= 1) {
                        alert("Vous devez conserver au moins une formule.");
                        return;
                      }
                      const updated = content.plans.filter((_, i) => i !== planIdx);
                      setContent({ ...content, plans: updated });
                    }}
                    className="text-xs text-red-400 hover:underline"
                  >
                    Supprimer
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50">
                    Nom de la formule
                  </label>
                  <input
                    value={plan.name}
                    onChange={(e) => {
                      const updated = [...content.plans];
                      updated[planIdx].name = e.target.value;
                      setContent({ ...content, plans: updated });
                    }}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs font-bold text-white focus:border-lime-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50">
                      Badge
                    </label>
                    <input
                      value={plan.statusBadge || ""}
                      onChange={(e) => {
                        const updated = [...content.plans];
                        updated[planIdx].statusBadge = e.target.value;
                        setContent({ ...content, plans: updated });
                      }}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-white focus:border-lime-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50">
                      Mise en avant
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = content.plans.map((p, i) => ({
                          ...p,
                          highlighted: i === planIdx ? !p.highlighted : false,
                          popularBadge: i === planIdx && !p.highlighted ? "Recommandée" : undefined,
                        }));
                        setContent({ ...content, plans: updated });
                      }}
                      className={`mt-1 w-full rounded-[6px] border py-2 text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                        plan.highlighted
                          ? "border-[#a3e635] bg-[#a3e635] text-[#0a0f1d] font-semibold"
                          : "border-white/10 bg-black/50 text-white/60 hover:text-white"
                      }`}
                    >
                      {plan.highlighted ? (
                        <>
                          <Star size={13} className="fill-current" />
                          <span>Recommandée</span>
                        </>
                      ) : (
                        "Standard"
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50">
                    Tarif ou Note (Ex: Tarif sur demande)
                  </label>
                  <input
                    value={plan.statusNote}
                    onChange={(e) => {
                      const updated = [...content.plans];
                      updated[planIdx].statusNote = e.target.value;
                      setContent({ ...content, plans: updated });
                    }}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-lime-400 font-bold focus:border-lime-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={plan.description}
                    onChange={(e) => {
                      const updated = [...content.plans];
                      updated[planIdx].description = e.target.value;
                      setContent({ ...content, plans: updated });
                    }}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-white focus:border-lime-400 focus:outline-none"
                  />
                </div>

                {/* Avantages inclus */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50">
                      Avantages inclus
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...content.plans];
                        updated[planIdx].features.push("Nouvel avantage");
                        setContent({ ...content, plans: updated });
                      }}
                      className="text-[10px] font-bold text-lime-400 hover:underline"
                    >
                      + Ajouter
                    </button>
                  </div>

                  <div className="mt-2 space-y-1.5">
                    {plan.features.map((feat, featIdx) => (
                      <div key={featIdx} className="flex items-center gap-1.5">
                        <input
                          value={feat}
                          onChange={(e) => {
                            const updated = [...content.plans];
                            updated[planIdx].features[featIdx] = e.target.value;
                            setContent({ ...content, plans: updated });
                          }}
                          className="w-full rounded-lg border border-white/10 bg-black/50 px-2.5 py-1.5 text-xs text-white focus:border-lime-400 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...content.plans];
                            updated[planIdx].features = updated[planIdx].features.filter(
                              (_, i) => i !== featIdx
                            );
                            setContent({ ...content, plans: updated });
                          }}
                          aria-label="Supprimer la caractéristique"
                          className="text-xs text-white/40 hover:text-red-400 p-1"
                        >
                          <X size={14} strokeWidth={1.75} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-full bg-lime-400 px-8 py-3.5 text-xs font-black uppercase tracking-wider text-black hover:bg-lime-300 transition shadow-lg shadow-lime-400/20 disabled:opacity-50"
          >
            {isPending ? "Enregistrement en cours..." : "Enregistrer les formules"}
          </button>
        </div>
      </form>
    </div>
  );
}
