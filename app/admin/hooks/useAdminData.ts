"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchAdminData } from "@/app/actions/admin-actions";
import { fetchGymDataAction } from "@/app/actions/gym-actions";
import type { Lead } from "@/lib/leads-store";
import type { SiteContentType } from "@/lib/content-store";
import type { Member, Payment, Attendance, GymStats } from "@/lib/gym-store";
import { logger } from "@/lib/logger";
import type { FeedbackKind } from "@/app/admin/admin-types";

export function useAdminData(showFeedback: (type: FeedbackKind, text: string) => void) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [content, setContent] = useState<SiteContentType | null>(null);
  const [supabaseConfigured, setSupabaseConfigured] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [stats, setStats] = useState<GymStats | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [adminRes, gymRes] = await Promise.all([fetchAdminData(), fetchGymDataAction()]);

      if (adminRes.success) {
        setLeads(adminRes.leads);
        setContent(adminRes.content);
        setSupabaseConfigured(adminRes.supabaseConfigured);
      } else {
        showFeedback("error", adminRes.error);
      }

      if (gymRes.success) {
        setMembers(gymRes.members);
        setPayments(gymRes.payments);
        setAttendances(gymRes.attendances);
        setStats(gymRes.stats);
      } else {
        showFeedback("error", gymRes.error);
      }
    } catch (err) {
      logger.error({ err }, "Erreur chargement données admin");
      showFeedback("error", "Impossible de charger les données du panneau.");
    } finally {
      setLoadingData(false);
    }
  }, [showFeedback]);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const [adminRes, gymRes] = await Promise.all([fetchAdminData(), fetchGymDataAction()]);
        if (!active) return;
        if (adminRes.success) {
          setLeads(adminRes.leads);
          setContent(adminRes.content);
          setSupabaseConfigured(adminRes.supabaseConfigured);
        } else {
          showFeedback("error", adminRes.error);
        }
        if (gymRes.success) {
          setMembers(gymRes.members);
          setPayments(gymRes.payments);
          setAttendances(gymRes.attendances);
          setStats(gymRes.stats);
        } else {
          showFeedback("error", gymRes.error);
        }
      } catch (err) {
        if (!active) return;
        logger.error({ err }, "Erreur chargement données admin");
        showFeedback("error", "Impossible de charger les données du panneau.");
      } finally {
        if (active) setLoadingData(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [showFeedback]);

  return {
    leads,
    setLeads,
    content,
    setContent,
    supabaseConfigured,
    members,
    payments,
    attendances,
    stats,
    loadingData,
    loadData,
  };
}
