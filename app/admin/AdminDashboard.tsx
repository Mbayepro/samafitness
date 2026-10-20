"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { exitDemoModeAction } from "@/app/actions/auth-actions";
import type { Lead } from "@/lib/leads-store";
import type { AdminContext } from "@/lib/auth/admin";
import type { Member, GymStats } from "@/lib/gym-store";
import type { TabKey } from "@/app/admin/admin-types";
import { useAdminFeedback } from "@/app/admin/hooks/useAdminFeedback";
import { useAdminData } from "@/app/admin/hooks/useAdminData";
import { useAdminActions } from "@/app/admin/hooks/useAdminActions";
import AdminHeader from "./components/AdminHeader";
import AdminTabs from "./components/AdminTabs";
import AdminFeedbackToast from "./components/AdminFeedback";
import GymOverviewTab from "./components/GymOverviewTab";
import GymMembersTab from "./components/GymMembersTab";
import GymAttendancesTab from "./components/GymAttendancesTab";
import GymPaymentsTab from "./components/GymPaymentsTab";
import ConvertLeadModal from "./components/ConvertLeadModal";
import ChangePasswordModal from "./components/ChangePasswordModal";
import SettingsTab from "./components/SettingsTab";
import { SkeletonTable } from "@/components/ui/skeleton/SkeletonTable";

export default function AdminDashboard({ admin }: { admin: AdminContext }) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const isSuperAdmin = admin.role === "super_admin";
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);
  const [preSelectedMemberForPayment, setPreSelectedMemberForPayment] = useState<Member | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const { feedback, showFeedback } = useAdminFeedback();
  const data = useAdminData(showFeedback);
  const actions = useAdminActions({
    content: data.content,
    setContent: data.setContent,
    setLeads: data.setLeads,
    convertingLead,
    setConvertingLead,
    loadData: data.loadData,
    showFeedback,
  });

  useEffect(() => {
    if (admin.isDemo) return;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") router.push("/admin/login");
    });
    return () => subscription.unsubscribe();
  }, [supabase, admin.isDemo, router]);

  const defaultStats: GymStats = {
    activeMembers: data.members.filter((m) => m.status === "actif").length,
    expiringSoonMembers: data.members.filter((m) => m.status === "expire_bientot").length,
    expiredMembers: data.members.filter((m) => m.status === "expire").length,
    totalMembers: data.members.length,
    todayAttendances: 0,
    weekAttendances: 0,
    monthRevenueFcfa: data.payments.reduce((acc, p) => acc + (p.amount_fcfa || 0), 0),
    monthExpensesFcfa: data.expenses.reduce((acc, e) => acc + (e.amount_fcfa || 0), 0),
    monthNetFcfa:
      data.payments.reduce((acc, p) => acc + (p.amount_fcfa || 0), 0) -
      data.expenses.reduce((acc, e) => acc + (e.amount_fcfa || 0), 0),
    history6Months: [],
  };
  const activeStats = data.stats || defaultStats;

  const handleLogout = async () => {
    try {
      if (admin?.isDemo) await exitDemoModeAction();
      else await supabase.auth.signOut();
    } catch {
      // Ignorer
    }
    window.location.href = "/admin/login";
  };

  const selectTab = (tab: TabKey) => {
    // Protéger l'onglet Paramètres côté client pour les gérants
    if (!isSuperAdmin && (tab === "settings" || tab === "staff" || tab === "site")) {
      setActiveTab("overview");
      return;
    }
    if (tab === "finances" || tab === "payments") {
      setPreSelectedMemberForPayment(null);
    }
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white selection:bg-lime-400 selection:text-black">
      <AdminHeader
        admin={admin}
        isSuperAdmin={isSuperAdmin}
        onOpenPassword={() => setIsPasswordModalOpen(true)}
        onLogout={handleLogout}
      />
      <AdminFeedbackToast feedback={feedback} />

      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8">
        <AdminTabs
          activeTab={activeTab}
          onSelectTab={selectTab}
          isSuperAdmin={isSuperAdmin}
          membersCount={data.members.length}
          leadsCount={data.leads.length}
          todayAttendances={activeStats.todayAttendances}
          relancesCount={activeStats.expiringSoonMembers + activeStats.expiredMembers}
          supabaseConfigured={data.supabaseConfigured}
        />

        {data.loadingData && <SkeletonTable rows={6} />}

        {activeTab === "overview" && (
          <div className="mt-8">
            <GymOverviewTab
              stats={activeStats}
              members={data.members}
              payments={data.payments}
              attendances={data.attendances}
              leads={data.leads}
              isSuperAdmin={isSuperAdmin}
              onNavigateTab={(tab) => selectTab(tab)}
              onQuickCheckIn={actions.handleQuickCheckIn}
              onOpenNewMemberModal={() => selectTab("members")}
              onOpenNewPaymentModal={() => {
                setPreSelectedMemberForPayment(null);
                selectTab("finances");
              }}
              showFeedback={showFeedback}
            />
          </div>
        )}

        {(activeTab === "members" || activeTab === "relances" || activeTab === "leads") && (
          <div className="mt-8">
            <GymMembersTab
              members={data.members}
              isSuperAdmin={isSuperAdmin}
              onSaveMember={actions.handleSaveMember}
              onDeleteMember={actions.handleDeleteMember}
              onQuickCheckIn={actions.handleQuickCheckIn}
              onOpenPaymentForMember={(member) => {
                setPreSelectedMemberForPayment(member);
                selectTab("finances");
              }}
              showFeedback={showFeedback}
              initialSubTab={
                activeTab === "relances" ? "relances" : activeTab === "leads" ? "leads" : "list"
              }
              leads={data.leads}
              isPending={actions.isPending}
              onRefreshLeads={data.loadData}
              onExportLeadsCSV={() => actions.handleExportCSV(data.leads)}
              onUpdateLeadStatus={actions.handleUpdateStatus}
              onDeleteLead={actions.handleDeleteLead}
              onStartConvertLead={(lead) => setConvertingLead(lead)}
            />
          </div>
        )}

        {activeTab === "attendances" && (
          <div className="mt-8">
            <GymAttendancesTab
              attendances={data.attendances}
              members={data.members}
              onRecordAttendance={actions.handleQuickCheckIn}
              onOpenPaymentForMember={(member) => {
                setPreSelectedMemberForPayment(member);
                selectTab("finances");
              }}
              showFeedback={showFeedback}
            />
          </div>
        )}

        {(activeTab === "finances" || activeTab === "payments") && (
          <div className="mt-8">
            <GymPaymentsTab
              payments={data.payments}
              expenses={data.expenses}
              members={data.members}
              isSuperAdmin={isSuperAdmin}
              preSelectedMember={preSelectedMemberForPayment}
              onRecordPayment={actions.handleRecordPayment}
              onRecordExpense={actions.handleRecordExpense}
              onDeleteExpense={actions.handleSoftDeleteExpense}
              showFeedback={showFeedback}
            />
          </div>
        )}

        {/* Onglet unifié Paramètres (Super-admin uniquement) */}
        {(activeTab === "settings" ||
          activeTab === "staff" ||
          activeTab === "site" ||
          activeTab === "club" ||
          activeTab === "plans" ||
          activeTab === "coach" ||
          activeTab === "faq" ||
          activeTab === "supabase") &&
          isSuperAdmin && (
            <div className="mt-8">
              <SettingsTab
                currentAdminEmail={admin.email}
                content={data.content}
                setContent={data.setContent}
                isPending={actions.isPending}
                supabaseConfigured={data.supabaseConfigured}
                showFeedback={showFeedback}
                onSaveClubInfo={actions.handleSaveClubInfo}
                onResetDefaults={actions.handleResetDefaults}
                onSavePlans={actions.handleSavePlans}
                onSaveCoach={actions.handleSaveCoach}
                onSaveFAQ={actions.handleSaveFAQ}
              />
            </div>
          )}

        {convertingLead && (
          <ConvertLeadModal
            lead={convertingLead}
            onClose={() => setConvertingLead(null)}
            onConfirm={actions.handleConfirmConvertLead}
            showFeedback={showFeedback}
          />
        )}

        <ChangePasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          adminEmail={admin.email}
          isDemo={admin.isDemo}
          showFeedback={showFeedback}
        />
      </div>
    </div>
  );
}
