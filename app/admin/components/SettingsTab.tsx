"use client";

import { useState, type FormEvent } from "react";
import type { SiteContentType } from "@/lib/content-store";
import type { FeedbackKind } from "@/app/admin/admin-types";
import StaffTab from "./StaffTab";
import SiteSettingsTab from "./SiteSettingsTab";

interface SettingsTabProps {
  currentAdminEmail: string;
  content: SiteContentType | null;
  setContent: React.Dispatch<React.SetStateAction<SiteContentType | null>>;
  isPending: boolean;
  supabaseConfigured: boolean;
  showFeedback: (type: FeedbackKind, text: string) => void;
  onSaveClubInfo: (e: FormEvent<HTMLFormElement>) => void;
  onResetDefaults: () => void;
  onSavePlans: (e: FormEvent) => void;
  onSaveCoach: (e: FormEvent<HTMLFormElement>) => void;
  onSaveFAQ: (e: FormEvent) => void;
}

export default function SettingsTab({
  currentAdminEmail,
  content,
  setContent,
  isPending,
  supabaseConfigured,
  showFeedback,
  onSaveClubInfo,
  onResetDefaults,
  onSavePlans,
  onSaveCoach,
  onSaveFAQ,
}: SettingsTabProps) {
  const [subSection, setSubSection] = useState<"staff" | "site">("staff");

  return (
    <div className="space-y-6">
      {/* Sélecteur de sous-section */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4">
        <button
          type="button"
          onClick={() => setSubSection("staff")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            subSection === "staff"
              ? "bg-white text-black shadow-md"
              : "border border-white/10 bg-white/5 text-white/70 hover:border-white/30 hover:text-white"
          }`}
        >
          <span>👥 Équipe & Gérants</span>
        </button>
        <button
          type="button"
          onClick={() => setSubSection("site")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            subSection === "site"
              ? "bg-white text-black shadow-md"
              : "border border-white/10 bg-white/5 text-white/70 hover:border-white/30 hover:text-white"
          }`}
        >
          <span>🌐 Réglages du Site</span>
          <span
            className={`h-2 w-2 rounded-full ${
              supabaseConfigured ? "bg-emerald-400" : "bg-amber-400"
            }`}
            title={supabaseConfigured ? "Supabase connecté" : "Supabase hors-ligne"}
          />
        </button>
      </div>

      {subSection === "staff" && (
        <StaffTab currentAdminEmail={currentAdminEmail} showFeedback={showFeedback} />
      )}

      {subSection === "site" && (
        <SiteSettingsTab
          content={content}
          setContent={setContent}
          isPending={isPending}
          supabaseConfigured={supabaseConfigured}
          showFeedback={showFeedback}
          onSaveClubInfo={onSaveClubInfo}
          onResetDefaults={onResetDefaults}
          onSavePlans={onSavePlans}
          onSaveCoach={onSaveCoach}
          onSaveFAQ={onSaveFAQ}
        />
      )}
    </div>
  );
}
