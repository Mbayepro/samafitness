"use client";

import { useTransition, type Dispatch, type FormEvent, type SetStateAction } from "react";
import {
  updateLeadStatusAction,
  archiveLeadsBatchAction,
  deleteLeadAction,
  saveSiteContentAction,
  resetSiteContentAction,
} from "@/app/actions/admin-actions";
import {
  saveMemberAction,
  deleteMemberAction,
  recordPaymentAction,
  recordAttendanceAction,
  convertLeadToMemberAction,
  recordExpenseAction,
  softDeleteExpenseAction,
} from "@/app/actions/gym-actions";
import type { Lead } from "@/lib/leads-store";
import type { SiteContentType } from "@/lib/content-store";
import type { Member, PaymentMethod, ExpenseCategory } from "@/lib/gym-store";
import type { FeedbackKind } from "@/app/admin/admin-types";

interface UseAdminActionsParams {
  content: SiteContentType | null;
  setContent: Dispatch<SetStateAction<SiteContentType | null>>;
  setLeads: Dispatch<SetStateAction<Lead[]>>;
  convertingLead: Lead | null;
  setConvertingLead: Dispatch<SetStateAction<Lead | null>>;
  loadData: () => Promise<void>;
  showFeedback: (type: FeedbackKind, text: string) => void;
}

export function useAdminActions({
  content,
  setContent,
  setLeads,
  convertingLead,
  setConvertingLead,
  loadData,
  showFeedback,
}: UseAdminActionsParams) {
  const [isPending, startTransition] = useTransition();

  const handleUpdateStatus = (id: string, newStatus: Lead["status"]) => {
    startTransition(async () => {
      const res = await updateLeadStatusAction(id, newStatus);
      if (!res.success) {
        showFeedback("error", res.error);
        return;
      }
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
      showFeedback("success", `Statut mis à jour : ${newStatus}`);
    });
  };

  const handleArchiveBatchLeads = (ids: string[]) => {
    if (!ids.length) return;
    startTransition(async () => {
      const res = await archiveLeadsBatchAction(ids);
      if (!res.success) {
        showFeedback("error", res.error);
        return;
      }
      setLeads((prev) =>
        prev.map((l) => (ids.includes(l.id) ? { ...l, status: "archivé" } : l))
      );
      showFeedback("success", `${ids.length} demande(s) archivée(s).`);
    });
  };

  const handleDeleteLead = (id: string, name: string) => {
    if (!confirm(`Supprimer définitivement la demande de ${name} ?`)) return;
    startTransition(async () => {
      const res = await deleteLeadAction(id);
      if (!res.success) {
        showFeedback("error", res.error);
        return;
      }
      setLeads((prev) => prev.filter((l) => l.id !== id));
      showFeedback("success", `Demande de ${name} supprimée.`);
    });
  };

  const handleExportCSV = (leads: Lead[]) => {
    if (leads.length === 0) {
      alert("Aucune demande à exporter.");
      return;
    }

    const headers = ["Date", "Nom", "Téléphone", "Salle", "Statut", "Message"];
    const rows = leads.map((l) => [
      new Date(l.created_at).toLocaleString("fr-FR"),
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.phone}"`,
      `"${l.club}"`,
      `"${l.status}"`,
      `"${(l.message || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sambafitness_leads_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveMember = async (
    data: Omit<Member, "id" | "status" | "created_at" | "updated_at"> & { id?: string }
  ) => {
    const res = await saveMemberAction(data);
    if (!res.success) {
      showFeedback("error", res.error);
      return;
    }
    await loadData();
  };

  const handleDeleteMember = async (id: string, name: string) => {
    const res = await deleteMemberAction(id);
    if (!res.success) {
      showFeedback("error", res.error);
      return;
    }
    showFeedback("success", `Membre ${name} supprimé.`);
    await loadData();
  };

  const handleQuickCheckIn = async (memberId: string): Promise<boolean> => {
    const res = await recordAttendanceAction(memberId);
    if (!res.success) {
      showFeedback("error", res.error);
      return false;
    }
    if (res.isExpired) {
      showFeedback("error", `Attention : l'abonnement de ${res.memberName} est expiré !`);
    } else {
      showFeedback("success", `Présence de ${res.memberName} enregistrée avec succès.`);
    }
    await loadData();
    return true;
  };

  const handleRecordPayment = async (data: {
    member_id: string;
    amount_fcfa: number;
    method: PaymentMethod;
    period_start: string;
    period_end: string;
    note?: string;
  }) => {
    const res = await recordPaymentAction(data);
    if (!res.success) {
      showFeedback("error", res.error);
      return;
    }
    await loadData();
  };

  const handleConfirmConvertLead = async (data: {
    full_name: string;
    phone: string;
    plan_id: string;
    duration_months: number;
    amount_fcfa?: number;
    payment_method?: PaymentMethod;
  }) => {
    if (!convertingLead) return;
    const res = await convertLeadToMemberAction(convertingLead.id, data);
    if (!res.success) {
      showFeedback("error", res.error);
      return;
    }
    setConvertingLead(null);
    await loadData();
  };

  const handleSaveClubInfo = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content) return;
    const formData = new FormData(e.currentTarget);

    const brandName = (formData.get("brandName") as string).trim();
    const shortName = (formData.get("shortName") as string).trim();
    const accentName = (formData.get("accentName") as string).trim();
    const slogan = (formData.get("slogan") as string).trim();
    const subSlogan = (formData.get("subSlogan") as string).trim();
    const description = (formData.get("description") as string).trim();

    const phone = (formData.get("phone") as string).trim();
    const phoneTel = phone.replace(/[\s.-]+/g, "");
    const whatsappNumber = (formData.get("whatsapp") as string).replace(/[^0-9]/g, "");
    const email = (formData.get("email") as string).trim();
    const address = (formData.get("address") as string).trim();
    const city = (formData.get("city") as string).trim();
    const hoursText = (formData.get("hoursText") as string).trim();

    const updatedContent: Partial<SiteContentType> = {
      brand: {
        ...content.brand,
        name: brandName,
        shortName,
        accentName,
        slogan,
        subSlogan,
        description,
      },
      contact: {
        ...content.contact,
        phone,
        phoneTel,
        whatsapp: {
          ...content.contact.whatsapp,
          number: whatsappNumber,
          displayNumber: phone,
        },
        email,
        address,
        city,
        mainCity: `${city}, Sénégal`,
        hoursText,
      },
    };

    startTransition(async () => {
      const res = await saveSiteContentAction(updatedContent);
      if (!res.success) return showFeedback("error", res.error);
      setContent(res.content);
      showFeedback("success", "Informations du club enregistrées avec succès !");
    });
  };

  const handleSavePlans = (e: FormEvent) => {
    e.preventDefault();
    if (!content) return;
    startTransition(async () => {
      const res = await saveSiteContentAction({ plans: content.plans });
      if (!res.success) return showFeedback("error", res.error);
      setContent(res.content);
      showFeedback("success", "Formules et tarifs enregistrés avec succès !");
    });
  };

  const handleSaveCoach = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content) return;
    const formData = new FormData(e.currentTarget);
    const name = (formData.get("coachName") as string).trim();
    const role = (formData.get("coachRole") as string).trim();
    const experience = (formData.get("coachExperience") as string).trim();
    const specialties = (formData.get("coachSpecialties") as string)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const bio = (formData.get("coachBio") as string).trim();
    const imageUrl = (formData.get("coachImageUrl") as string).trim();

    const updatedCoaches = [
      {
        ...content.coaches[0],
        id: "samba-diop",
        name,
        role,
        experience,
        specialties,
        bio,
        imageUrl: imageUrl || content.coaches[0]?.imageUrl || "",
      },
    ];

    startTransition(async () => {
      const res = await saveSiteContentAction({ coaches: updatedCoaches });
      if (!res.success) return showFeedback("error", res.error);
      setContent(res.content);
      showFeedback("success", "Profil du coach enregistré avec succès !");
    });
  };

  const handleSaveFAQ = (e: FormEvent) => {
    e.preventDefault();
    if (!content) return;
    startTransition(async () => {
      const res = await saveSiteContentAction({ faq: content.faq });
      if (!res.success) return showFeedback("error", res.error);
      setContent(res.content);
      showFeedback("success", "Questions / Réponses enregistrées avec succès !");
    });
  };

  const handleSaveShop = (e: FormEvent) => {
    e.preventDefault();
    if (!content) return;
    startTransition(async () => {
      const res = await saveSiteContentAction({ shop: content.shop });
      if (!res.success) return showFeedback("error", res.error);
      setContent(res.content);
      showFeedback("success", "Configuration de la Boutique enregistrée avec succès !");
    });
  };

  const handleResetDefaults = () => {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir réinitialiser toutes les données aux valeurs par défaut de Ndioum ?"
      )
    )
      return;

    startTransition(async () => {
      const res = await resetSiteContentAction();
      if (!res.success) return showFeedback("error", res.error);
      setContent(res.content);
      showFeedback("success", "Données réinitialisées aux valeurs par défaut.");
    });
  };

  const handleRecordExpense = async (data: {
    amount_fcfa: number;
    category: ExpenseCategory;
    description?: string;
    paid_at: string;
  }) => {
    return new Promise<boolean>((resolve) => {
      startTransition(async () => {
        const res = await recordExpenseAction(data);
        if (!res.success) {
          showFeedback("error", res.error);
          resolve(false);
          return;
        }
        await loadData();
        showFeedback("success", "Dépense enregistrée avec succès.");
        resolve(true);
      });
    });
  };

  const handleSoftDeleteExpense = (id: string, description?: string | null) => {
    const label = description ? `« ${description} »` : "cette dépense";
    if (!confirm(`Confirmez-vous l'archivage de ${label} ?`)) return;

    startTransition(async () => {
      const res = await softDeleteExpenseAction(id);
      if (!res.success) {
        showFeedback("error", res.error);
        return;
      }
      await loadData();
      showFeedback("success", "Dépense archivée.");
    });
  };

  return {
    isPending,
    handleUpdateStatus,
    handleArchiveBatchLeads,
    handleDeleteLead,
    handleExportCSV,
    handleSaveMember,
    handleDeleteMember,
    handleQuickCheckIn,
    handleRecordPayment,
    handleConfirmConvertLead,
    handleSaveClubInfo,
    handleSavePlans,
    handleSaveCoach,
    handleSaveFAQ,
    handleSaveShop,
    handleResetDefaults,
    handleRecordExpense,
    handleSoftDeleteExpense,
  };
}
