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
  const base = "flex-shrink-0 whitespace-nowrap min-h-[36px] transition-colors rounded-md px-3.5 py-1.5 text-xs ";
  return (
    base +
    (active
      ? "bg-lime-400 text-black font-semibold"
      : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white")
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
          className={`flex items-center gap-1.5 ${tabClass(isOverview)}`}
        >
          <span>Accueil</span>
        </button>

        {/* 2. Membres */}
        <button
          type="button"
          onClick={() => onSelectTab("members")}
          aria-current={isMembers ? "page" : undefined}
          className={`flex items-center gap-2 ${tabClass(isMembers)}`}
        >
          <span>Membres</span>
          <span
            className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${
              isMembers ? "bg-black/20 text-black" : "bg-white/10 text-white/70"
            }`}
          >
            {membersCount}
          </span>
        </button>

        {/* 3. Présences */}
        <button
          type="button"
          onClick={() => onSelectTab("attendances")}
          aria-current={isAttendances ? "page" : undefined}
          className={`flex items-center gap-2 ${tabClass(isAttendances)}`}
        >
          <span>Présences</span>
          {todayAttendances > 0 && (
            <span
              className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${
                isAttendances ? "bg-black/20 text-black" : "bg-white/10 text-white/70"
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
          className={`flex items-center gap-1.5 ${tabClass(isFinances)}`}
        >
          <span>Finances</span>
        </button>

        {/* 5. Paramètres (Super-admin uniquement) */}
        {isSuperAdmin && (
          <button
            type="button"
            onClick={() => onSelectTab("settings")}
            aria-current={isSettings ? "page" : undefined}
            className={`flex items-center gap-1.5 ${tabClass(isSettings)}`}
          >
            <span>Paramètres</span>
          </button>
        )}
      </div>
    </nav>
  );
}
