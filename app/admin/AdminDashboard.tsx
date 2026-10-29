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
import QRScannerModal from "./components/QRScannerModal";
import MemberDetailsDrawer from "./components/MemberDetailsDrawer";
import MemberBadgeCardModal from "./components/MemberBadgeCardModal";
import SettingsTab from "./components/SettingsTab";
import { SkeletonTable } from "@/components/ui/skeleton/SkeletonTable";

export default function AdminDashboard({ admin }: { admin: AdminContext }) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const isSuperAdmin = admin.role === "super_admin";
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);
  const [preSelectedMemberForPayment, setPreSelectedMemberForPayment] = useState<Member | null>(null);
  const [autoOpenPaymentTrigger, setAutoOpenPaymentTrigger] = useState(0);
  const [autoOpenCreateMemberTrigger, setAutoOpenCreateMemberTrigger] = useState(0);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isGlobalScannerOpen, setIsGlobalScannerOpen] = useState(false);
  const [overviewDrawerMember, setOverviewDrawerMember] = useState<Member | null>(null);
  const [overviewBadgeMember, setOverviewBadgeMember] = useState<Member | null>(null);

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

  const pendingLeadsCount = data.leads.filter(
    (l) => l.status === "nouveau" || l.status === "contacté"
  ).length;

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
    if (!isSuperAdmin && (tab === "settings" || tab === "staff" || tab === "site")) {
      setActiveTab("overview");
      return;
    }
    if (tab !== "members") {
      setAutoOpenCreateMemberTrigger(0);
    }
    if (tab === "finances" || tab === "payments") {
      setPreSelectedMemberForPayment(null);
      setAutoOpenPaymentTrigger(0);
    }
    setActiveTab(tab);
  };

  const handleTriggerNewMember = () => {
    setActiveTab("members");
    setAutoOpenCreateMemberTrigger((c) => c + 1);
  };

  const handleTriggerPayment = (member?: Member) => {
    setPreSelectedMemberForPayment(member || null);
    setActiveTab("finances");
    setAutoOpenPaymentTrigger((c) => c + 1);
  };

  const activeOverviewDrawerMember = overviewDrawerMember
    ? data.members.find((m) => m.id === overviewDrawerMember.id) || overviewDrawerMember
    : null;

  return (
    <div className="min-h-screen bg-[#080808] text-white selection:bg-lime-400 selection:text-black">
      <AdminHeader
        admin={admin}
        isSuperAdmin={isSuperAdmin}
        onOpenPassword={() => setIsPasswordModalOpen(true)}
        onLogout={handleLogout}
        onOpenScanner={() => setIsGlobalScannerOpen(true)}
        onOpenNewMember={handleTriggerNewMember}
        onOpenNewPayment={() => handleTriggerPayment()}
      />
      <AdminFeedbackToast feedback={feedback} />

      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8">
        <AdminTabs
          activeTab={activeTab}
          onSelectTab={selectTab}
          isSuperAdmin={isSuperAdmin}
          membersCount={data.members.length}
          leadsCount={pendingLeadsCount}
          todayAttendances={activeStats.todayAttendances}
          relancesCount={activeStats.expiringSoonMembers + activeStats.expiredMembers}
          supabaseConfigured={data.supabaseConfigured}
        />

        {data.loadingData && <SkeletonTable rows={6} />}

        {activeTab === "overview" && (
          <div className="mt-6">
            <GymOverviewTab
              stats={activeStats}
              members={data.members}
              payments={data.payments}
              attendances={data.attendances}
              leads={data.leads}
              isSuperAdmin={isSuperAdmin}
              onNavigateTab={(tab) => selectTab(tab)}
              onQuickCheckIn={actions.handleQuickCheckIn}
              onOpenNewMemberModal={handleTriggerNewMember}
              onOpenNewPaymentModal={(member) => handleTriggerPayment(member)}
              onOpenScannerModal={() => setIsGlobalScannerOpen(true)}
              onSelectMemberDetails={(member) => setOverviewDrawerMember(member)}
              showFeedback={showFeedback}
            />
          </div>
        )}

        {(activeTab === "members" || activeTab === "relances" || activeTab === "leads") && (
          <div className="mt-6">
            <GymMembersTab
              key={`${activeTab}-${autoOpenCreateMemberTrigger}`}
              members={data.members}
              payments={data.payments}
              attendances={data.attendances}
              isSuperAdmin={isSuperAdmin}
              onSaveMember={actions.handleSaveMember}
              onDeleteMember={actions.handleDeleteMember}
              onQuickCheckIn={actions.handleQuickCheckIn}
              onOpenPaymentForMember={(member) => handleTriggerPayment(member)}
              showFeedback={showFeedback}
              initialSubTab={
                activeTab === "relances" ? "relances" : activeTab === "leads" ? "leads" : "list"
              }
              defaultOpenCreate={autoOpenCreateMemberTrigger > 0}
              leads={data.leads}
              isPending={actions.isPending}
              onRefreshLeads={data.loadData}
              onExportLeadsCSV={() => actions.handleExportCSV(data.leads)}
              onUpdateLeadStatus={actions.handleUpdateStatus}
              onArchiveBatchLeads={actions.handleArchiveBatchLeads}
              onDeleteLead={actions.handleDeleteLead}
              onStartConvertLead={(lead) => setConvertingLead(lead)}
            />
          </div>
        )}

        {activeTab === "attendances" && (
          <div className="mt-6">
            <GymAttendancesTab
              attendances={data.attendances}
              members={data.members}
              onRecordAttendance={actions.handleQuickCheckIn}
              onOpenPaymentForMember={(member) => handleTriggerPayment(member)}
              onOpenScannerModal={() => setIsGlobalScannerOpen(true)}
              showFeedback={showFeedback}
            />
          </div>
        )}

        {(activeTab === "finances" || activeTab === "payments") && (
          <div className="mt-6">
            <GymPaymentsTab
              key={`payments-${preSelectedMemberForPayment?.id || "none"}-${autoOpenPaymentTrigger}`}
              payments={data.payments}
              expenses={data.expenses}
              members={data.members}
              history6Months={activeStats.history6Months}
              isSuperAdmin={isSuperAdmin}
              preSelectedMember={preSelectedMemberForPayment}
              defaultOpenPayment={Boolean(preSelectedMemberForPayment) || autoOpenPaymentTrigger > 0}
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
            <div className="mt-6">
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
                onSaveShop={actions.handleSaveShop}
                onSaveCoach={actions.handleSaveCoach}
                onSaveFAQ={actions.handleSaveFAQ}
              />
            </div>
          )}

        {/* Tiroir Fiche Membre ouvert depuis l'Accueil */}
        <MemberDetailsDrawer
          member={activeOverviewDrawerMember}
          payments={data.payments}
          attendances={data.attendances}
          isSuperAdmin={isSuperAdmin}
          onClose={() => setOverviewDrawerMember(null)}
          onQuickCheckIn={async (id) => {
            await actions.handleQuickCheckIn(id);
          }}
          onOpenBadge={(m) => setOverviewBadgeMember(m)}
          onOpenPayment={(m) => handleTriggerPayment(m)}
          onEditMember={() => {
            setOverviewDrawerMember(null);
            selectTab("members");
          }}
          onDeleteMember={actions.handleDeleteMember}
        />

        {overviewBadgeMember && (
          <MemberBadgeCardModal
            member={overviewBadgeMember}
            onClose={() => setOverviewBadgeMember(null)}
            onMemberUpdated={(updated) => setOverviewBadgeMember(updated)}
          />
        )}

        {/* Modale Globale Scanner QR */}
        {isGlobalScannerOpen && (
          <QRScannerModal
            onClose={() => setIsGlobalScannerOpen(false)}
            showFeedback={showFeedback}
            onAttendanceRecorded={() => void data.loadData()}
            onOpenPaymentModal={(memberId) => {
              const found = data.members.find((m) => m.id === memberId);
              handleTriggerPayment(found);
            }}
          />
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
