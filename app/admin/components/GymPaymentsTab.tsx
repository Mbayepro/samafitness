"use client";

import { useState, useMemo } from "react";
import { ArrowUpRight, ArrowDownRight, CreditCard, Receipt, X } from "lucide-react";
import type { Payment, Member, PaymentMethod, Expense, ExpenseCategory } from "@/lib/gym-store";
import { formatAdminFCFA, formatAdminDate } from "./ui/AdminFormatters";

interface GymPaymentsTabProps {
  payments: Payment[];
  expenses?: Expense[];
  members: Member[];
  history6Months?: {
    monthKey: string;
    monthLabel: string;
    revenue: number;
    expenses: number;
    net: number;
  }[];
  isSuperAdmin?: boolean;
  preSelectedMember?: Member | null;
  onRecordPayment: (data: {
    member_id: string;
    amount_fcfa: number;
    method: PaymentMethod;
    period_start: string;
    period_end: string;
    note?: string;
  }) => Promise<void>;
  onRecordExpense?: (data: {
    amount_fcfa: number;
    category: ExpenseCategory;
    description?: string;
    paid_at: string;
  }) => Promise<boolean>;
  onDeleteExpense?: (id: string, description?: string | null) => void;
  showFeedback: (type: "success" | "error", text: string) => void;
}

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  loyer: "Loyer du local",
  electricite: "Électricité (Senelec)",
  eau_internet: "Eau & Internet",
  salaires: "Salaires & Coachs",
  materiel: "Achat de Matériel",
  maintenance: "Entretien & Réparations",
  autre: "Autre dépense",
};

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  loyer: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  electricite: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  eau_internet: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  salaires: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  materiel: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  maintenance: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  autre: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
};

export default function GymPaymentsTab({
  payments,
  expenses = [],
  members,
  history6Months = [],
  isSuperAdmin = false,
  preSelectedMember,
  onRecordPayment,
  onRecordExpense,
  onDeleteExpense,
  showFeedback,
}: GymPaymentsTabProps) {
  // Navigation sous-vues : Entrées / Sorties
  const [subView, setSubView] = useState<"incomes" | "expenses">("incomes");

  // Totaux et échelle pour le graphique sur 6 mois
  const max6MonthsVal = useMemo(() => {
    if (!history6Months || history6Months.length === 0) return 100000;
    const peak = Math.max(
      ...history6Months.flatMap((m) => [m.revenue, m.expenses])
    );
    return Math.max(peak, 100000);
  }, [history6Months]);

  const totals6Months = useMemo(() => {
    if (!history6Months || history6Months.length === 0) {
      return { revenue: 0, expenses: 0, net: 0 };
    }
    return history6Months.reduce(
      (acc, m) => ({
        revenue: acc.revenue + m.revenue,
        expenses: acc.expenses + m.expenses,
        net: acc.net + m.net,
      }),
      { revenue: 0, expenses: 0, net: 0 }
    );
  }, [history6Months]);

  // ── ÉTAT VUE ENTRÉES (PAIEMENTS) ───────────────────────────────────
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(Boolean(preSelectedMember));
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Formulaire Paiement
  const [memberId, setMemberId] = useState(preSelectedMember?.id || "");
  const [amountFcfa, setAmountFcfa] = useState<number>(15000);
  const [method, setMethod] = useState<PaymentMethod>("Wave");
  const [periodStart, setPeriodStart] = useState(() => {
    return preSelectedMember?.end_date && preSelectedMember.end_date >= new Date().toISOString().split("T")[0]
      ? preSelectedMember.end_date
      : new Date().toISOString().split("T")[0];
  });
  const [periodEnd, setPeriodEnd] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split("T")[0];
  });
  const [note, setNote] = useState("");

  // ── ÉTAT VUE SORTIES (DÉPENSES) ────────────────────────────────────
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseSearch, setExpenseSearch] = useState("");
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<string>("all");
  const [submittingExpense, setSubmittingExpense] = useState(false);

  // Formulaire Dépense
  const [expenseAmount, setExpenseAmount] = useState<number | "">("");
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>("loyer");
  const [expensePaidAt, setExpensePaidAt] = useState(() => new Date().toISOString().split("T")[0]);
  const [expenseDescription, setExpenseDescription] = useState("");

  const openNewPaymentModal = (targetMember?: Member) => {
    const m = targetMember || (members[0] as Member | undefined);
    setMemberId(m?.id || "");
    setAmountFcfa(15000);
    setMethod("Wave");

    const todayStr = new Date().toISOString().split("T")[0];
    const baseStart = m?.end_date && m.end_date >= todayStr ? m.end_date : todayStr;
    setPeriodStart(baseStart);

    const end = new Date(baseStart);
    end.setMonth(end.getMonth() + 1);
    setPeriodEnd(end.toISOString().split("T")[0]);

    setNote("");
    setIsPaymentModalOpen(true);
  };

  const applyDuration = (months: number, defaultAmount?: number) => {
    const base = periodStart ? new Date(periodStart) : new Date();
    base.setMonth(base.getMonth() + months);
    setPeriodEnd(base.toISOString().split("T")[0]);
    if (defaultAmount) {
      setAmountFcfa(defaultAmount);
    }
  };

  const handleMemberChange = (id: string) => {
    setMemberId(id);
    const m = members.find((x) => x.id === id);
    if (m) {
      const todayStr = new Date().toISOString().split("T")[0];
      const baseStart = m.end_date && m.end_date >= todayStr ? m.end_date : todayStr;
      setPeriodStart(baseStart);
      const end = new Date(baseStart);
      end.setMonth(end.getMonth() + 1);
      setPeriodEnd(end.toISOString().split("T")[0]);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || !amountFcfa || !periodStart || !periodEnd) {
      showFeedback("error", "Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setSubmittingPayment(true);
    try {
      await onRecordPayment({
        member_id: memberId,
        amount_fcfa: Number(amountFcfa),
        method,
        period_start: periodStart,
        period_end: periodEnd,
        note: note.trim() || undefined,
      });
      setIsPaymentModalOpen(false);
      showFeedback("success", "Paiement enregistré et abonnement prolongé !");
    } catch {
      showFeedback("error", "Erreur lors de l'enregistrement du paiement.");
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount || Number(expenseAmount) <= 0 || !expensePaidAt) {
      showFeedback("error", "Veuillez renseigner un montant valide et une date.");
      return;
    }

    if (!onRecordExpense) {
      showFeedback("error", "Action non autorisée.");
      return;
    }

    setSubmittingExpense(true);
    try {
      const success = await onRecordExpense({
        amount_fcfa: Number(expenseAmount),
        category: expenseCategory,
        description: expenseDescription.trim() || undefined,
        paid_at: expensePaidAt,
      });
      if (success) {
        setIsExpenseModalOpen(false);
        setExpenseAmount("");
        setExpenseDescription("");
        setExpensePaidAt(new Date().toISOString().split("T")[0]);
      }
    } catch {
      showFeedback("error", "Erreur lors de l'enregistrement de la dépense.");
    } finally {
      setSubmittingExpense(false);
    }
  };

  const handleExportCSV = () => {
    if (payments.length === 0) {
      alert("Aucun paiement à exporter.");
      return;
    }

    const headers = [
      "ID",
      "Date",
      "Adhérent",
      "Téléphone",
      "Montant_FCFA",
      "Méthode",
      "Début",
      "Fin",
      "Encaissé_Par",
      "Note",
    ];
    const rows = payments.map((p) => [
      p.id,
      formatAdminDate(p.created_at),
      `"${(p.member_name || "").replace(/"/g, '""')}"`,
      `"${p.member_phone || ""}"`,
      p.amount_fcfa,
      `"${p.method}"`,
      formatAdminDate(p.period_start),
      formatAdminDate(p.period_end),
      `"${p.recorded_by || ""}"`,
      `"${(p.note || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `sambafitness_paiements_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtrage Entrées
  const filteredPayments = payments.filter((p) => {
    const matchesMethod = methodFilter === "all" ? true : p.method === methodFilter;
    const matchesSearch =
      (p.member_name || "").toLowerCase().includes(searchFilter.toLowerCase()) ||
      (p.member_phone || "").includes(searchFilter) ||
      (p.note && p.note.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchesMethod && matchesSearch;
  });

  const totalFilteredFcfa = filteredPayments.reduce((s, p) => s + (p.amount_fcfa || 0), 0);

  // Répartition des encaissements du mois par méthode
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthPayments = payments.filter((p) => new Date(p.created_at) >= startOfMonth);

  const waveTotal = thisMonthPayments
    .filter((p) => p.method === "Wave")
    .reduce((s, p) => s + (p.amount_fcfa || 0), 0);
  const omTotal = thisMonthPayments
    .filter((p) => p.method === "Orange Money")
    .reduce((s, p) => s + (p.amount_fcfa || 0), 0);
  const cashTotal = thisMonthPayments
    .filter((p) => p.method === "Espèces")
    .reduce((s, p) => s + (p.amount_fcfa || 0), 0);

  const monthTotal = waveTotal + omTotal + cashTotal || 1;
  const wavePct = Math.round((waveTotal / monthTotal) * 100);
  const omPct = Math.round((omTotal / monthTotal) * 100);
  const cashPct = Math.round((cashTotal / monthTotal) * 100);

  // Filtrage Sorties (Dépenses)
  const activeExpenses = useMemo(() => {
    return expenses.filter((e) => !e.deleted_at);
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    return activeExpenses.filter((e) => {
      const matchesCategory =
        expenseCategoryFilter === "all" ? true : e.category === expenseCategoryFilter;
      const q = expenseSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (e.description && e.description.toLowerCase().includes(q)) ||
        (CATEGORY_LABELS[e.category] && CATEGORY_LABELS[e.category].toLowerCase().includes(q)) ||
        (e.created_by && e.created_by.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [activeExpenses, expenseCategoryFilter, expenseSearch]);

  const totalFilteredExpensesFcfa = filteredExpenses.reduce(
    (s, e) => s + (Number(e.amount_fcfa) || 0),
    0
  );

  // Statistiques des dépenses du mois en cours
  const thisMonthExpenses = useMemo(() => {
    return activeExpenses.filter((e) => new Date(e.created_at) >= startOfMonth);
  }, [activeExpenses, startOfMonth]);

  const monthExpensesTotal = thisMonthExpenses.reduce(
    (s, e) => s + (Number(e.amount_fcfa) || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* ── GRAPHIQUE REVENUS VS DÉPENSES SUR 6 MOIS (SUPER-ADMIN) ───── */}
      {isSuperAdmin && history6Months && history6Months.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-[#121212] p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-sm font-black uppercase text-white flex items-center gap-2">
                <span>Finances · 6 derniers mois</span>
              </h2>
              <p className="mt-0.5 text-xs text-white/50">
                Comparaison mensuelle des entrées d&apos;abonnements et des sorties de caisse.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" />
                <span className="text-white/70 font-semibold">Revenus</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-rose-400" />
                <span className="text-white/70 font-semibold">Dépenses</span>
              </div>
            </div>
          </div>

          {/* Bar Chart 6 Mois */}
          <div className="mt-6 grid grid-cols-3 sm:grid-cols-6 gap-3">
            {history6Months.map((m) => {
              const revPct = Math.round((m.revenue / max6MonthsVal) * 100);
              const expPct = Math.round((m.expenses / max6MonthsVal) * 100);
              const isNetPositive = m.net >= 0;

              return (
                <div key={m.monthKey} className="flex flex-col items-center">
                  {/* Zone des barres */}
                  <div
                    className="relative flex h-36 w-full items-end justify-center gap-1.5 rounded-xl border border-white/5 bg-black/40 p-2"
                    title={`${m.monthLabel} : Revenus ${m.revenue.toLocaleString("fr-FR")} FCFA | Dépenses ${m.expenses.toLocaleString("fr-FR")} FCFA | Solde ${m.net.toLocaleString("fr-FR")} FCFA`}
                  >
                    {/* Barre Revenus */}
                    <div
                      className="w-1/2 max-w-[20px] rounded-t bg-emerald-400 transition-all hover:brightness-110"
                      style={{ height: `${Math.max(4, revPct)}%` }}
                    />
                    {/* Barre Dépenses */}
                    <div
                      className="w-1/2 max-w-[20px] rounded-t bg-rose-400 transition-all hover:brightness-110"
                      style={{ height: `${Math.max(4, expPct)}%` }}
                    />
                  </div>

                  {/* Libellé Mois */}
                  <span className="mt-2 text-xs font-bold text-white truncate max-w-full">
                    {m.monthLabel}
                  </span>

                  {/* Solde net du mois : masqué si négligeable (< 1 000 FCFA) pour éviter les +0k inutiles */}
                  {Math.abs(m.net) >= 1000 && (
                    <span
                      className={`mt-0.5 text-[10px] font-black font-mono ${
                        isNetPositive ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {isNetPositive ? "+" : ""}
                      {(m.net / 1000).toFixed(0)}k
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Synthèse cumulée 6 mois */}
          <div className="mt-6 pt-4 border-t border-white/5 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-white/[0.02] p-2.5">
              <p className="text-[10px] font-bold uppercase text-white/40">Total Revenus 6m</p>
              <p className="text-sm font-black text-emerald-400 mt-0.5">
                {totals6Months.revenue.toLocaleString("fr-FR")} FCFA
              </p>
            </div>
            <div className="rounded-xl bg-white/[0.02] p-2.5">
              <p className="text-[10px] font-bold uppercase text-white/40">Total Dépenses 6m</p>
              <p className="text-sm font-black text-rose-400 mt-0.5">
                {totals6Months.expenses.toLocaleString("fr-FR")} FCFA
              </p>
            </div>
            <div className="rounded-xl bg-white/[0.02] p-2.5">
              <p className="text-[10px] font-bold uppercase text-white/40">Solde Net Cumulé</p>
              <p
                className={`text-sm font-black mt-0.5 ${
                  totals6Months.net >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {totals6Months.net >= 0 ? "+" : ""}
                {totals6Months.net.toLocaleString("fr-FR")} FCFA
              </p>
            </div>
          </div>
        </div>
      )}
      {/* ── SÉLECTEUR DE SOUS-VUE : ENTRÉES / SORTIES (SUPER-ADMIN) ───── */}
      {isSuperAdmin && (
        <div role="tablist" aria-label="Sous-vues finances" className="flex items-center gap-2 border-b border-white/10 pb-4">
          <button
            type="button"
            role="tab"
            aria-selected={subView === "incomes"}
            onClick={() => setSubView("incomes")}
            className={`flex items-center gap-2 rounded-[8px] px-4 py-2 text-xs font-medium transition min-h-[40px] ${
              subView === "incomes"
                ? "bg-white text-black font-semibold"
                : "border border-white/10 bg-white/5 text-white/70 hover:border-white/30 hover:text-white"
            }`}
          >
            <ArrowUpRight size={15} strokeWidth={1.75} />
            <span>Entrées (Paiements)</span>
            <span
              className={`rounded-[4px] px-1.5 py-0.5 text-[11px] font-medium ${
                subView === "incomes" ? "bg-black/10 text-black font-semibold" : "bg-white/10 text-white/60"
              }`}
            >
              {payments.length}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={subView === "expenses"}
            onClick={() => setSubView("expenses")}
            className={`flex items-center gap-2 rounded-[8px] px-4 py-2 text-xs font-medium transition min-h-[40px] ${
              subView === "expenses"
                ? "bg-white text-black font-semibold"
                : "border border-white/10 bg-white/5 text-white/70 hover:border-white/30 hover:text-white"
            }`}
          >
            <ArrowDownRight size={15} strokeWidth={1.75} />
            <span>Sorties (Dépenses)</span>
            <span
              className={`rounded-[4px] px-1.5 py-0.5 text-[11px] font-medium ${
                subView === "expenses" ? "bg-black/10 text-black font-semibold" : "bg-white/10 text-white/60"
              }`}
            >
              {activeExpenses.length}
            </span>
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── SOUS-VUE 1 : ENTRÉES (PAIEMENTS DES ADHÉRENTS) ───────────── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {subView === "incomes" && (
        <>
          {/* Répartition des paiements du mois */}
          <div className="rounded-2xl border border-white/10 bg-[#121212] p-4 sm:p-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-black uppercase text-white tracking-wide">
                  Répartition par méthode (Mois en cours)
                </h2>
                <p className="mt-0.5 text-xs text-white/50">
                  Total encaissé ce mois :{" "}
                  <strong className="text-emerald-400">
                    {(waveTotal + omTotal + cashTotal).toLocaleString("fr-FR")} FCFA
                  </strong>
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* Wave */}
              <div className="rounded-xl bg-white/[0.03] p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#1DC0EF]">Wave</span>
                  <span className="text-[11px] font-black text-white/70">{wavePct}%</span>
                </div>
                <p className="mt-2 text-base font-black text-white">
                  {waveTotal.toLocaleString("fr-FR")}{" "}
                  <span className="text-[11px] font-normal text-white/50">FCFA</span>
                </p>
                <div className="mt-2 h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                  <div
                    style={{ width: `${wavePct}%` }}
                    className="h-full rounded-full bg-[#1DC0EF]"
                  />
                </div>
              </div>

              {/* Orange Money */}
              <div className="rounded-xl bg-white/[0.03] p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#FF7900]">Orange Money</span>
                  <span className="text-[11px] font-black text-white/70">{omPct}%</span>
                </div>
                <p className="mt-2 text-base font-black text-white">
                  {omTotal.toLocaleString("fr-FR")}{" "}
                  <span className="text-[11px] font-normal text-white/50">FCFA</span>
                </p>
                <div className="mt-2 h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                  <div
                    style={{ width: `${omPct}%` }}
                    className="h-full rounded-full bg-[#FF7900]"
                  />
                </div>
              </div>

              {/* Espèces */}
              <div className="rounded-xl bg-white/[0.03] p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-400">Espèces</span>
                  <span className="text-[11px] font-black text-white/70">{cashPct}%</span>
                </div>
                <p className="mt-2 text-base font-black text-white">
                  {cashTotal.toLocaleString("fr-FR")}{" "}
                  <span className="text-[11px] font-normal text-white/50">FCFA</span>
                </p>
                <div className="mt-2 h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                  <div
                    style={{ width: `${cashPct}%` }}
                    className="h-full rounded-full bg-emerald-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tableau et Actions des Paiements */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#121212]">
            {/* Barre d'outils / Filtres intégrée */}
            <div className="flex flex-col gap-4 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex flex-1 flex-wrap items-center gap-2.5">
                <input
                  type="text"
                  placeholder="Rechercher par adhérent..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full sm:w-64 rounded-xl border border-white/10 bg-black/50 px-3.5 py-2 text-xs text-white placeholder-white/30 focus:border-lime-400 focus:outline-none"
                />

                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-white focus:border-lime-400 focus:outline-none"
                >
                  <option value="all">Tous les moyens</option>
                  <option value="Wave">Wave</option>
                  <option value="Orange Money">Orange Money</option>
                  <option value="Espèces">Espèces</option>
                </select>

                <span className="text-xs text-white/50">
                  Total :{" "}
                  <strong className="text-emerald-400">
                    {totalFilteredFcfa.toLocaleString("fr-FR")} FCFA
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-white/90 hover:bg-white/10 transition"
                >
                  Exporter CSV
                </button>
                <button
                  type="button"
                  onClick={() => openNewPaymentModal()}
                  className="rounded-md bg-lime-400 px-3.5 py-2 text-xs font-semibold text-black hover:bg-lime-300 transition"
                >
                  + Encaisser un paiement
                </button>
              </div>
            </div>

            {/* Contenu du tableau ou état vide */}
            {filteredPayments.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-[6px] border border-white/5 bg-white/[0.02] text-zinc-400">
                  <CreditCard size={18} strokeWidth={1.75} />
                </div>
                <h3 className="mt-3 text-sm font-medium text-white">Aucun paiement trouvé</h3>
                <p className="mt-1 text-xs text-white/50">
                  Les encaissements enregistrés apparaîtront ici avec possibilité d&apos;imprimer ou
                  d&apos;envoyer le reçu par WhatsApp.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-black/40 text-xs font-semibold text-white/60">
                      <th className="py-3 px-6">Adhérent</th>
                      <th className="py-3 px-4">Montant</th>
                      <th className="py-3 px-4">Moyen</th>
                      <th className="py-3 px-4">Période couverte</th>
                      <th className="py-3 px-4">Date & encaissé par</th>
                      <th className="py-3 px-6 text-right">Reçu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {filteredPayments.map((p) => (
                      <tr key={p.id} className="transition hover:bg-white/[0.02]">
                        <td className="py-4 px-6">
                          <div className="font-bold text-white">{p.member_name || "Membre"}</div>
                          <div className="text-[11px] font-mono text-white/40">
                            {p.member_phone || ""}
                          </div>
                          {p.note && (
                            <p className="mt-1 text-[11px] text-white/40 italic">Réf : {p.note}</p>
                          )}
                        </td>

                        <td className="py-4 px-4">
                          <span className="font-mono text-sm font-black text-emerald-400">
                            {p.amount_fcfa.toLocaleString("fr-FR")} FCFA
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                              p.method === "Wave"
                                ? "bg-[#1DC0EF]/10 text-[#1DC0EF] border border-[#1DC0EF]/30"
                                : p.method === "Orange Money"
                                ? "bg-[#FF7900]/10 text-[#FF7900] border border-[#FF7900]/30"
                                : "bg-emerald-400/10 text-emerald-400 border border-emerald-400/30"
                            }`}
                          >
                            {p.method}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <span className="font-mono text-[11px] text-white/70">
                            Du {formatAdminDate(p.period_start)} au{" "}
                            <strong className="text-white">{formatAdminDate(p.period_end)}</strong>
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <span className="block text-white/70">
                            {formatAdminDate(p.created_at)}
                          </span>
                          <span className="text-[11px] text-white/40">
                            Par {p.recorded_by || "Admin"}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => setSelectedReceipt(p)}
                            className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-medium text-white hover:border-white/30 transition"
                          >
                            Reçu
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── SOUS-VUE 2 : SORTIES (DÉPENSES DU CLUB - SUPER ADMIN) ─────── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {subView === "expenses" && isSuperAdmin && (
        <>
          {/* Synthèse mensuelle des dépenses */}
          <div className="rounded-2xl border border-white/10 bg-[#121212] p-4 sm:p-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-black uppercase text-white tracking-wide">
                  Dépenses du club (Mois en cours)
                </h2>
                <p className="mt-0.5 text-xs text-white/50">
                  Total engagé ce mois :{" "}
                  <strong className="text-rose-400">
                    {monthExpensesTotal.toLocaleString("fr-FR")} FCFA
                  </strong>
                </p>
              </div>
            </div>

            {/* Répartition par catégorie */}
            <div className="mt-4 flex flex-wrap gap-2">
              {(
                [
                  "loyer",
                  "electricite",
                  "eau_internet",
                  "salaires",
                  "materiel",
                  "maintenance",
                  "autre",
                ] as ExpenseCategory[]
              ).map((cat) => {
                const totalCat = thisMonthExpenses
                  .filter((e) => e.category === cat)
                  .reduce((s, e) => s + (Number(e.amount_fcfa) || 0), 0);
                if (totalCat === 0 && monthExpensesTotal > 0) return null;
                return (
                  <div
                    key={cat}
                    className="flex items-center gap-2 rounded-xl bg-white/[0.03] px-3 py-2 text-xs"
                  >
                    <span className="text-white/60">{CATEGORY_LABELS[cat]} :</span>
                    <span className="font-mono font-bold text-white">
                      {totalCat.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tableau et Actions des Dépenses */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#121212]">
            {/* Barre d'outils / Filtres */}
            <div className="flex flex-col gap-4 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex flex-1 flex-wrap items-center gap-2.5">
                <input
                  type="text"
                  placeholder="Rechercher par motif, catégorie..."
                  value={expenseSearch}
                  onChange={(e) => setExpenseSearch(e.target.value)}
                  className="w-full sm:w-64 rounded-xl border border-white/10 bg-black/50 px-3.5 py-2 text-xs text-white placeholder-white/30 focus:border-rose-400 focus:outline-none"
                />

                <select
                  value={expenseCategoryFilter}
                  onChange={(e) => setExpenseCategoryFilter(e.target.value)}
                  className="rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-white focus:border-rose-400 focus:outline-none"
                >
                  <option value="all">Toutes les catégories ({activeExpenses.length})</option>
                  <option value="loyer">Loyer</option>
                  <option value="electricite">Électricité</option>
                  <option value="eau_internet">Eau & Internet</option>
                  <option value="salaires">Salaires & Coachs</option>
                  <option value="materiel">Matériel</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="autre">Autre</option>
                </select>

                <span className="text-xs text-white/50">
                  Total :{" "}
                  <strong className="text-rose-400">
                    {totalFilteredExpensesFcfa.toLocaleString("fr-FR")} FCFA
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(true)}
                  className="rounded-md bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-rose-500 transition"
                >
                  + Enregistrer une dépense
                </button>
              </div>
            </div>

            {/* Contenu du tableau ou état vide */}
            {filteredExpenses.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-[6px] border border-white/5 bg-white/[0.02] text-zinc-400">
                  <Receipt size={18} strokeWidth={1.75} />
                </div>
                <h3 className="mt-3 text-sm font-medium text-white">Aucune dépense enregistrée</h3>
                <p className="mt-1 text-xs text-white/50">
                  {expenseSearch || expenseCategoryFilter !== "all"
                    ? "Aucune dépense ne correspond à vos filtres de recherche."
                    : "Enregistrez les sorties (loyer, salaires, électricité...) pour suivre la rentabilité nette du club."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-black/40 text-xs font-semibold text-white/60">
                      <th className="py-3 px-6">Date de paiement</th>
                      <th className="py-3 px-4">Catégorie</th>
                      <th className="py-3 px-6">Description / Motif</th>
                      <th className="py-3 px-4">Montant</th>
                      <th className="py-3 px-4">Saisi par</th>
                      <th className="py-3 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {filteredExpenses.map((exp) => (
                      <tr key={exp.id} className="transition hover:bg-white/[0.02]">
                        <td className="py-4 px-6">
                          <span className="font-mono text-xs font-bold text-white">
                            {formatAdminDate(exp.paid_at)}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex rounded-lg border px-2.5 py-1 text-[11px] font-bold ${
                              CATEGORY_COLORS[exp.category] ||
                              "bg-white/10 text-white border-white/20"
                            }`}
                          >
                            {CATEGORY_LABELS[exp.category] || exp.category}
                          </span>
                        </td>

                        <td className="py-4 px-6">
                          <p className="font-semibold text-white/90">
                            {exp.description || (
                              <span className="text-white/40 italic">Sans description</span>
                            )}
                          </p>
                        </td>

                        <td className="py-4 px-4">
                          <span className="font-mono text-sm font-black text-rose-400">
                            -{Number(exp.amount_fcfa).toLocaleString("fr-FR")} FCFA
                          </span>
                        </td>

                        <td className="py-4 px-4 text-white/50">
                          {exp.created_by || "Super Admin"}
                        </td>

                        <td className="py-4 px-6 text-right">
                          {onDeleteExpense && (
                            <button
                              onClick={() => onDeleteExpense(exp.id, exp.description)}
                              className="rounded-md border border-red-500/25 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400 hover:bg-red-500 hover:text-white transition"
                              title="Archiver cette dépense"
                            >
                              Archiver
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── MODAL NOUVELLE DÉPENSE (SUPER-ADMIN) ─────────────────────── */}
      {isExpenseModalOpen && isSuperAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-[#121212] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-black uppercase text-white">
                Enregistrer une nouvelle dépense
              </h3>
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                aria-label="Fermer"
                className="rounded-[6px] p-2 text-white/50 hover:bg-white/10 hover:text-white transition"
              >
                <X size={16} strokeWidth={1.75} />
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/70">
                  Montant de la dépense (FCFA) *
                </label>
                <input
                  type="number"
                  min={1}
                  step={100}
                  required
                  placeholder="Ex : 25000"
                  value={expenseAmount}
                  onChange={(e) =>
                    setExpenseAmount(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-2.5 text-sm font-bold text-rose-400 placeholder-white/30 focus:border-rose-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/70">
                  Catégorie *
                </label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value as ExpenseCategory)}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-2.5 text-xs text-white focus:border-rose-400 focus:outline-none"
                >
                  <option value="loyer">Loyer du local</option>
                  <option value="electricite">Électricité (Senelec)</option>
                  <option value="eau_internet">Eau & Internet</option>
                  <option value="salaires">Salaires & Coachs</option>
                  <option value="materiel">Achat de Matériel</option>
                  <option value="maintenance">Entretien & Réparations</option>
                  <option value="autre">Autre dépense</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/70">
                  Date de paiement *
                </label>
                <input
                  type="date"
                  required
                  value={expensePaidAt}
                  onChange={(e) => setExpensePaidAt(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-2.5 text-xs text-white focus:border-rose-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/70">
                  Description / Justificatif (optionnel)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex : Facture Senelec compteur salle cardio..."
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-2 text-xs text-white placeholder-white/30 focus:border-rose-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="rounded-xl border border-white/15 px-4 py-2.5 text-xs font-bold text-white/70 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submittingExpense}
                  className="rounded-xl bg-rose-500 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-rose-600 disabled:opacity-50"
                >
                  {submittingExpense ? "Enregistrement..." : "Confirmer la dépense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL ENCAISSEMENT PAIEMENT ─────────────────────────────── */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-[#121212] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-black uppercase text-white">
                Enregistrer un paiement & prolonger
              </h3>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                aria-label="Fermer"
                className="rounded-[6px] p-2 text-white/50 hover:bg-white/10 hover:text-white transition"
              >
                <X size={16} strokeWidth={1.75} />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/70">
                  Adhérent *
                </label>
                <select
                  value={memberId}
                  onChange={(e) => handleMemberChange(e.target.value)}
                  required
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-2.5 text-xs text-white focus:border-lime-400 focus:outline-none"
                >
                  <option value="">-- Sélectionner le membre --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name} ({m.phone}) - Échéance : {m.end_date}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/70">
                  Montant réglé (FCFA) *
                </label>
                <input
                  type="number"
                  min={500}
                  step={500}
                  value={amountFcfa}
                  onChange={(e) => setAmountFcfa(Number(e.target.value))}
                  required
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-2.5 text-sm font-bold text-lime-400 focus:border-lime-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/70">
                  Moyen de paiement *
                </label>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  {(["Wave", "Orange Money", "Espèces"] as PaymentMethod[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMethod(m)}
                      className={`rounded-xl border py-2 text-xs font-bold transition ${
                        method === m
                          ? m === "Wave"
                            ? "bg-[#1DC0EF] text-black border-[#1DC0EF]"
                            : m === "Orange Money"
                            ? "bg-[#FF7900] text-black border-[#FF7900]"
                            : "bg-emerald-400 text-black border-emerald-400"
                          : "border-white/10 bg-white/5 text-white/70 hover:border-white/30"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/70">
                  Raccourcis de durée (recalcule la date d&apos;échéance)
                </label>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => applyDuration(1, 15000)}
                    className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-white hover:border-lime-400 hover:text-lime-400"
                  >
                    1 Mois (15.000 F)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyDuration(3, 40000)}
                    className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-white hover:border-lime-400 hover:text-lime-400"
                  >
                    3 Mois (40.000 F)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyDuration(6, 75000)}
                    className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-white hover:border-lime-400 hover:text-lime-400"
                  >
                    6 Mois (75.000 F)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyDuration(12, 140000)}
                    className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-white hover:border-lime-400 hover:text-lime-400"
                  >
                    1 An (140.000 F)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/70">
                    Début période *
                  </label>
                  <input
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    required
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs text-white focus:border-lime-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/70">
                    Fin période (Nouvelle échéance) *
                  </label>
                  <input
                    type="date"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                    required
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs text-white focus:border-lime-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/70">
                  Note / Référence (optionnel)
                </label>
                <input
                  type="text"
                  placeholder="Ex : Référence transaction Wave #123456"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-2.5 text-xs text-white placeholder-white/30 focus:border-lime-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="rounded-xl border border-white/15 px-4 py-2.5 text-xs font-bold text-white/70 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submittingPayment}
                  className="rounded-xl bg-lime-400 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-black hover:bg-lime-300 disabled:opacity-50"
                >
                  {submittingPayment ? "Enregistrement..." : "Confirmer le règlement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL REÇU OFFICIEL (IMPRESSION & WHATSAPP) ─────────────── */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-white/15 bg-[#121212] p-6 sm:p-8 shadow-2xl text-white">
            {/* Zone de reçu imprimable */}
            <div id="receipt-printable" className="rounded-2xl border border-white/10 bg-black/80 p-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h4 className="text-base font-black tracking-wider text-white">
                    SAMBA<span className="text-lime-400">FITNESS</span>
                  </h4>
                  <p className="text-[10px] uppercase tracking-widest text-white/50">Club Ndioum · Sénégal</p>
                </div>
                <div className="text-right">
                  <span className="rounded-full border border-lime-400/30 bg-lime-400/10 px-2.5 py-1 text-[9px] font-black uppercase text-lime-400">
                    Reçu Officiel
                  </span>
                  <p className="mt-1 text-[10px] font-mono text-white/40">#{selectedReceipt.id.slice(-8)}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/50">Adhérent :</span>
                  <span className="font-bold text-white">{selectedReceipt.member_name}</span>
                </div>
                {selectedReceipt.member_phone && (
                  <div className="flex justify-between">
                    <span className="text-white/50">Téléphone :</span>
                    <span className="font-mono text-white/70">{selectedReceipt.member_phone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-white/50">Date de paiement :</span>
                  <span className="text-white/70">
                    {formatAdminDate(selectedReceipt.created_at)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Moyen :</span>
                  <span className="font-bold text-white">{selectedReceipt.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Période couverte :</span>
                  <span className="font-mono text-[11px] text-white">
                    {formatAdminDate(selectedReceipt.period_start)} au {formatAdminDate(selectedReceipt.period_end)}
                  </span>
                </div>

                <div className="my-3 border-t border-dashed border-white/20 pt-3 flex justify-between items-center">
                  <span className="text-xs uppercase font-black text-white">Montant payé :</span>
                  <span className="text-lg font-black text-lime-400 font-mono">
                    {selectedReceipt.amount_fcfa.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
              </div>

              <div className="mt-4 border-t border-white/10 pt-3 text-center text-[10px] text-white/40">
                Merci pour votre confiance. Bon entraînement !
              </div>
            </div>

            {/* Boutons d'action Reçu */}
            <div className="mt-6 flex flex-col gap-2">
              {(() => {
                const cleanPhone = (selectedReceipt.member_phone || "").replace(/[^0-9+]/g, "");
                const whatsappNumber = cleanPhone.startsWith("+")
                  ? cleanPhone.substring(1)
                  : cleanPhone.startsWith("00")
                  ? cleanPhone.substring(2)
                  : cleanPhone.startsWith("7")
                  ? `221${cleanPhone}`
                  : cleanPhone;

                const message = encodeURIComponent(
                  `*SAMBA FITNESS NDIOUM - REÇU DE PAIEMENT*\n` +
                    `--------------------------------\n` +
                    `Bonjour ${selectedReceipt.member_name},\n` +
                    `Nous confirmons la bonne réception de votre paiement de *${selectedReceipt.amount_fcfa.toLocaleString("fr-FR")} FCFA* via *${selectedReceipt.method}*.\n\n` +
                    `Période : du ${formatAdminDate(selectedReceipt.period_start)} au ${formatAdminDate(selectedReceipt.period_end)}\n` +
                    `Reçu : #${selectedReceipt.id.slice(-8)}\n\n` +
                    `Merci pour votre fidélité et à très vite à la salle !`
                );

                return (
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${message}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-center text-xs font-black uppercase text-black hover:bg-emerald-400 transition"
                  >
                    <span>Envoyer le reçu sur WhatsApp</span>
                  </a>
                );
              })()}

              <button
                onClick={() => window.print()}
                className="rounded-xl border border-white/15 bg-white/5 py-2.5 text-xs font-bold text-white hover:border-lime-400 transition"
              >
                Imprimer le reçu
              </button>

              <button
                onClick={() => setSelectedReceipt(null)}
                className="mt-1 text-xs text-white/50 hover:text-white"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
