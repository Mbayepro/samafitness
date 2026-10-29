"use client";

import { useState, type FormEvent } from "react";
import type { SiteContentType } from "@/lib/content-store";
import type { FeedbackKind } from "@/app/admin/admin-types";
import ClubInfoTab from "./ClubInfoTab";
import PlansEditorTab from "./PlansEditorTab";
import ShopEditorTab from "./ShopEditorTab";
import CoachEditorTab from "./CoachEditorTab";
import FaqEditorTab from "./FaqEditorTab";
import SupabaseTab from "./SupabaseTab";

type SiteSubTab = "club" | "plans" | "shop" | "coach" | "faq" | "supabase";

interface SiteSettingsTabProps {
  content: SiteContentType | null;
  setContent: React.Dispatch<React.SetStateAction<SiteContentType | null>>;
  isPending: boolean;
  supabaseConfigured: boolean;
  showFeedback: (type: FeedbackKind, text: string) => void;
  onSaveClubInfo: (e: FormEvent<HTMLFormElement>) => void;
  onResetDefaults: () => void;
  onSavePlans: (e: FormEvent) => void;
  onSaveShop?: (e: FormEvent) => void;
  onSaveCoach: (e: FormEvent<HTMLFormElement>) => void;
  onSaveFAQ: (e: FormEvent) => void;
}

export default function SiteSettingsTab({
  content,
  setContent,
  isPending,
  supabaseConfigured,
  showFeedback,
  onSaveClubInfo,
  onResetDefaults,
  onSavePlans,
  onSaveShop,
  onSaveCoach,
  onSaveFAQ,
}: SiteSettingsTabProps) {
  const [subTab, setSubTab] = useState<SiteSubTab>("club");

  const subTabs: { key: SiteSubTab; label: string }[] = [
    { key: "club", label: "Infos Salle" },
    { key: "plans", label: "Tarifs & Formules" },
    { key: "shop", label: "Boutique & Nutrition" },
    { key: "coach", label: "Coach" },
    { key: "faq", label: "Questions Fréquentes (FAQ)" },
    { key: "supabase", label: "Base de Données Supabase" },
  ];

  return (
    <div className="space-y-4">
      {/* En-tête des paramètres du site */}
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#121212] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <h2 className="text-base sm:text-lg font-black uppercase text-white flex items-center gap-2">
            <span>Configuration du Site Vitrine</span>
          </h2>
          <p className="mt-1 text-xs text-white/50">
            Personnalisez les coordonnées, horaires, tarifs affichés au public et surveillez la base de données.
          </p>
        </div>

        {/* Sous-navigation simplifiée */}
        <div className="flex flex-wrap gap-1 rounded-2xl border border-white/10 bg-black/40 p-1.5">
          {subTabs.map(({ key, label }) => {
            const isActive = subTab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSubTab(key)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                  isActive
                    ? "bg-white/15 text-white font-bold shadow-sm"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {label}
                {key === "supabase" && (
                  <span
                    className={`ml-2 inline-block h-2 w-2 rounded-full ${
                      supabaseConfigured ? "bg-emerald-400" : "bg-amber-400"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenu du sous-onglet sélectionné */}
      {subTab === "club" && content && (
        <ClubInfoTab
          content={content}
          isPending={isPending}
          onSubmit={onSaveClubInfo}
          onResetDefaults={onResetDefaults}
        />
      )}

      {subTab === "plans" && content && (
        <PlansEditorTab
          content={content}
          setContent={setContent}
          isPending={isPending}
          onSubmit={onSavePlans}
        />
      )}

      {subTab === "shop" && content && onSaveShop && (
        <ShopEditorTab
          content={content}
          setContent={setContent}
          isPending={isPending}
          onSubmit={onSaveShop}
        />
      )}

      {subTab === "coach" && content && (
        <CoachEditorTab
          content={content}
          isPending={isPending}
          onSubmit={onSaveCoach}
        />
      )}

      {subTab === "faq" && content && (
        <FaqEditorTab
          content={content}
          setContent={setContent}
          isPending={isPending}
          onSubmit={onSaveFAQ}
        />
      )}

      {subTab === "supabase" && (
        <SupabaseTab supabaseConfigured={supabaseConfigured} showFeedback={showFeedback} />
      )}
    </div>
  );
}
