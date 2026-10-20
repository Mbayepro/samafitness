"use client";

import type { TabKey } from "@/app/admin/admin-types";

interface AdminTabsProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  isSuperAdmin: boolean;
  membersCount: number;
  leadsCount: number;
  todayAttendances: number;
  relancesCount: number;
  supabaseConfigured: boolean;
}

function tabClass(active: boolean) {
  const base = "flex-shrink-0 whitespace-nowrap min-h-[38px] transition-all ";
  return (
    base +
    (active
      ? "bg-lime-400 text-black shadow-md shadow-lime-400/20 font-bold"
      : "border border-white/10 bg-white/5 text-white/70 hover:border-lime-400/40 hover:text-white")
  );
}

export default function AdminTabs({
  activeTab,
  onSelectTab,
  isSuperAdmin,
  membersCount,
  leadsCount,
  todayAttendances,
  relancesCount,
  supabaseConfigured,
}: AdminTabsProps) {
  const isOverview = activeTab === "overview";
  const isMembers = activeTab === "members" || activeTab === "relances" || activeTab === "leads";
  const isAttendances = activeTab === "attendances";
  const isFinances = activeTab === "finances" || activeTab === "payments";
  const isSettings =
    activeTab === "settings" ||
    activeTab === "staff" ||
    activeTab === "site" ||
    activeTab === "club" ||
    activeTab === "plans" ||
    activeTab === "coach" ||
    activeTab === "faq" ||
    activeTab === "supabase";

  const totalMemberAlerts = relancesCount + leadsCount;

  return (
    <nav
      aria-label="Navigation du tableau de bord"
      className="border-b border-white/10 pb-3"
    >
      <div className="flex items-center gap-2 overflow-x-auto px-0.5 pb-1 text-xs [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* 1. Accueil */}
        <button
          type="button"
          onClick={() => onSelectTab("overview")}
          aria-current={isOverview ? "page" : undefined}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 ${tabClass(isOverview)}`}
        >
          <span>Accueil</span>
        </button>

        {/* 2. Membres */}
        <button
          type="button"
          onClick={() => onSelectTab("members")}
          aria-current={isMembers ? "page" : undefined}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 ${tabClass(isMembers)}`}
        >
          <span>Membres</span>
          <span
            className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
              isMembers ? "bg-black text-lime-400" : "bg-white/10 text-white"
            }`}
          >
            {membersCount}
          </span>
          {totalMemberAlerts > 0 && !isMembers && (
            <span
              className="flex h-2 w-2 rounded-full bg-amber-400"
              title={`${totalMemberAlerts} relance(s) ou demande(s)`}
            />
          )}
        </button>

        {/* 3. Présences */}
        <button
          type="button"
          onClick={() => onSelectTab("attendances")}
          aria-current={isAttendances ? "page" : undefined}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 ${tabClass(isAttendances)}`}
        >
          <span>Présences</span>
          {todayAttendances > 0 && (
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                isAttendances ? "bg-black text-lime-400" : "bg-cyan-400/20 text-cyan-300"
              }`}
            >
              {todayAttendances}
            </span>
          )}
        </button>

        {/* 4. Finances */}
        <button
          type="button"
          onClick={() => onSelectTab("finances")}
          aria-current={isFinances ? "page" : undefined}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 ${tabClass(isFinances)}`}
        >
          <span>Finances</span>
        </button>

        {/* 5. Paramètres (Super-admin uniquement) */}
        {isSuperAdmin && (
          <button
            type="button"
            onClick={() => onSelectTab("settings")}
            aria-current={isSettings ? "page" : undefined}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 ${tabClass(isSettings)}`}
          >
            <span>Paramètres</span>
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                supabaseConfigured ? "bg-emerald-400" : "bg-amber-400"
              }`}
              title={supabaseConfigured ? "Supabase connecté" : "Supabase hors-ligne"}
            />
          </button>
        )}
      </div>
    </nav>
  );
}
