"use client";

import { LayoutDashboard, Users, BellRing, Inbox, CalendarCheck, Wallet, Settings } from "lucide-react";
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
  const base =
    "flex-shrink-0 whitespace-nowrap min-h-[38px] transition-colors rounded-lg px-3.5 py-1.5 text-xs ";
  return (
    base +
    (active
      ? "bg-lime-400 text-black font-bold shadow-sm"
      : "border border-white/10 bg-white/[0.04] text-white/75 hover:bg-white/10 hover:text-white")
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
}: AdminTabsProps) {
  const isOverview = activeTab === "overview";
  const isMembers = activeTab === "members";
  const isRelances = activeTab === "relances";
  const isLeads = activeTab === "leads";
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
        {/* 1. Accueil / Cockpit */}
        <button
          type="button"
          onClick={() => onSelectTab("overview")}
          aria-current={isOverview ? "page" : undefined}
          className={`flex items-center gap-1.5 ${tabClass(isOverview)}`}
        >
          <LayoutDashboard size={14} strokeWidth={2} />
          <span>Accueil</span>
        </button>

        {/* 2. Adhérents */}
        <button
          type="button"
          onClick={() => onSelectTab("members")}
          aria-current={isMembers ? "page" : undefined}
          className={`flex items-center gap-2 ${tabClass(isMembers)}`}
        >
          <Users size={14} strokeWidth={2} />
          <span>Adhérents</span>
          <span
            className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${
              isMembers ? "bg-black/20 text-black" : "bg-white/10 text-white/70"
            }`}
          >
            {membersCount}
          </span>
        </button>

        {/* 3. Relances (Accès direct 1-clic avec badge orange) */}
        <button
          type="button"
          onClick={() => onSelectTab("relances")}
          aria-current={isRelances ? "page" : undefined}
          className={`flex items-center gap-2 ${tabClass(isRelances)}`}
        >
          <BellRing size={14} strokeWidth={2} className={isRelances ? "text-black" : relancesCount > 0 ? "text-amber-400" : ""} />
          <span>Relances</span>
          {relancesCount > 0 && (
            <span
              className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${
                isRelances
                  ? "bg-black/20 text-black"
                  : "bg-amber-400/20 text-amber-300 border border-amber-400/30"
              }`}
            >
              {relancesCount}
            </span>
          )}
        </button>

        {/* 4. Demandes Web / Prospects */}
        <button
          type="button"
          onClick={() => onSelectTab("leads")}
          aria-current={isLeads ? "page" : undefined}
          className={`flex items-center gap-2 ${tabClass(isLeads)}`}
        >
          <Inbox size={14} strokeWidth={2} className={isLeads ? "text-black" : leadsCount > 0 ? "text-cyan-400" : ""} />
          <span>Prospects</span>
          {leadsCount > 0 && (
            <span
              className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${
                isLeads
                  ? "bg-black/20 text-black"
                  : "bg-cyan-400/20 text-cyan-300 border border-cyan-400/30"
              }`}
            >
              {leadsCount}
            </span>
          )}
        </button>

        {/* 5. Présences */}
        <button
          type="button"
          onClick={() => onSelectTab("attendances")}
          aria-current={isAttendances ? "page" : undefined}
          className={`flex items-center gap-2 ${tabClass(isAttendances)}`}
        >
          <CalendarCheck size={14} strokeWidth={2} />
          <span>Présences</span>
          {todayAttendances > 0 && (
            <span
              className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${
                isAttendances ? "bg-black/20 text-black" : "bg-lime-400/15 text-lime-400"
              }`}
            >
              {todayAttendances}
            </span>
          )}
        </button>

        {/* 6. Finances */}
        <button
          type="button"
          onClick={() => onSelectTab("finances")}
          aria-current={isFinances ? "page" : undefined}
          className={`flex items-center gap-1.5 ${tabClass(isFinances)}`}
        >
          <Wallet size={14} strokeWidth={2} />
          <span>Trésorerie</span>
        </button>

        {/* 7. Paramètres (Super-admin uniquement) */}
        {isSuperAdmin && (
          <button
            type="button"
            onClick={() => onSelectTab("settings")}
            aria-current={isSettings ? "page" : undefined}
            className={`flex items-center gap-1.5 ${tabClass(isSettings)}`}
          >
            <Settings size={14} strokeWidth={2} />
            <span>Paramètres</span>
          </button>
        )}
      </div>
    </nav>
  );
}
