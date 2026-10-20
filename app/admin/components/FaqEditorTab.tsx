"use client";

import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { SiteContentType } from "@/lib/content-store";

interface FaqEditorTabProps {
  content: SiteContentType;
  setContent: Dispatch<SetStateAction<SiteContentType | null>>;
  isPending: boolean;
  onSubmit: (e: FormEvent) => void;
}

export default function FaqEditorTab({ content, setContent, isPending, onSubmit }: FaqEditorTabProps) {
  return (
    <div className="mt-8">
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black uppercase text-white">Gestion de la FAQ</h3>
            <p className="mt-1 text-xs text-white/50">
              Ajoutez ou modifiez les questions fréquentes posées par les clients.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              const newFaq = {
                question: "Nouvelle question ?",
                answer: "Réponse détaillée...",
              };
              setContent({ ...content, faq: [...content.faq, newFaq] });
            }}
            className="rounded-full border border-lime-400/30 bg-lime-400/10 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-lime-400 hover:bg-lime-400 hover:text-black transition"
          >
            + Ajouter une question
          </button>
        </div>

        <div className="space-y-4">
          {content.faq.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-white/10 bg-[#121212] p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-lime-400">
                  Question #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const updated = content.faq.filter((_, i) => i !== idx);
                    setContent({ ...content, faq: updated });
                  }}
                  className="text-xs text-red-400 hover:underline"
                >
                  Supprimer
                </button>
              </div>

              <div>
                <input
                  value={item.question}
                  onChange={(e) => {
                    const updated = [...content.faq];
                    updated[idx].question = e.target.value;
                    setContent({ ...content, faq: updated });
                  }}
                  placeholder="Intitulé de la question..."
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2 text-xs font-bold text-white focus:border-lime-400 focus:outline-none"
                />
              </div>

              <div>
                <textarea
                  rows={2}
                  value={item.answer}
                  onChange={(e) => {
                    const updated = [...content.faq];
                    updated[idx].answer = e.target.value;
                    setContent({ ...content, faq: updated });
                  }}
                  placeholder="Réponse apportée..."
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2 text-xs text-white/80 focus:border-lime-400 focus:outline-none"
                />
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
            {isPending ? "Enregistrement..." : "Enregistrer la FAQ"}
          </button>
        </div>
      </form>
    </div>
  );
}
