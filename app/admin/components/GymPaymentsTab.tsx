"use client";

import { useState } from "react";
import type { Payment, Member, PaymentMethod } from "@/lib/gym-store";

interface GymPaymentsTabProps {
  payments: Payment[];
  members: Member[];
  preSelectedMember?: Member | null;
  onRecordPayment: (data: {
    member_id: string;
    amount_fcfa: number;
    method: PaymentMethod;
    period_start: string;
    period_end: string;
    note?: string;
  }) => Promise<void>;
  showFeedback: (type: "success" | "error", text: string) => void;
}

export default function GymPaymentsTab({
  payments,
  members,
  preSelectedMember,
  onRecordPayment,
  showFeedback,
}: GymPaymentsTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(Boolean(preSelectedMember));
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [submitting, setSubmitting] = useState(false);

  // Form State
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
    setIsModalOpen(true);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || !amountFcfa || !periodStart || !periodEnd) {
      showFeedback("error", "Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setSubmitting(true);
    try {
      await onRecordPayment({
        member_id: memberId,
        amount_fcfa: Number(amountFcfa),
        method,
        period_start: periodStart,
        period_end: periodEnd,
        note: note.trim() || undefined,
      });
      setIsModalOpen(false);
      showFeedback("success", "Paiement enregistré et abonnement prolongé !");
    } catch {
      showFeedback("error", "Erreur lors de l'enregistrement du paiement.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    if (payments.length === 0) {
      alert("Aucun paiement à exporter.");
      return;
    }

    const headers = ["ID", "Date", "Adhérent", "Téléphone", "Montant_FCFA", "Méthode", "Début", "Fin", "Encaissé_Par", "Note"];
    const rows = payments.map((p) => [
      p.id,
      new Date(p.created_at).toLocaleDateString("fr-FR"),
      `"${(p.member_name || "").replace(/"/g, '""')}"`,
      `"${p.member_phone || ""}"`,
      p.amount_fcfa,
      `"${p.method}"`,
      p.period_start,
      p.period_end,
      `"${p.recorded_by || ""}"`,
      `"${(p.note || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sambafitness_paiements_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  return (
    <div className="space-y-6">
      {/* ── RÉPARTITION DES PAIEMENTS DU MOIS ───────────────────────── */}
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
              <div style={{ width: `${wavePct}%` }} className="h-full rounded-full bg-[#1DC0EF]" />
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
              <div style={{ width: `${omPct}%` }} className="h-full rounded-full bg-[#FF7900]" />
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
              <div style={{ width: `${cashPct}%` }} className="h-full rounded-full bg-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      {/* ── TABLEAU ET ACTIONS FINANCES UNIFIÉS ──────────────────────── */}
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
              Total : <strong className="text-emerald-400">{totalFilteredFcfa.toLocaleString("fr-FR")} FCFA</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-bold text-white hover:border-lime-400 hover:text-lime-400 transition"
            >
              Exporter CSV
            </button>
            <button
              type="button"
              onClick={() => openNewPaymentModal()}
              className="rounded-xl bg-lime-400 px-4 py-2 text-xs font-black uppercase tracking-wider text-black hover:bg-lime-300 transition shadow-md shadow-lime-400/20"
            >
              + Encaisser un Paiement
            </button>
          </div>
        </div>

        {/* Contenu du tableau ou état vide */}
        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-xs font-black text-white/40">
            PAY
          </span>
          <h3 className="mt-3 text-lg font-bold text-white">Aucun paiement trouvé</h3>
          <p className="mt-1 text-xs text-white/50">
            Les encaissements enregistrés apparaîtront ici avec possibilité d&apos;imprimer ou d&apos;envoyer le reçu par WhatsApp.
          </p>
        </div>
      ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-black/40 text-[10px] font-black uppercase tracking-wider text-white/50">
                  <th className="py-4 px-6">Adhérent</th>
                  <th className="py-4 px-4">Montant</th>
                  <th className="py-4 px-4">Moyen</th>
                  <th className="py-4 px-4">Période couverte</th>
                  <th className="py-4 px-4">Date & Encaissé par</th>
                  <th className="py-4 px-6 text-right">Reçu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="transition hover:bg-white/[0.02]">
                    <td className="py-4 px-6">
                      <div className="font-bold text-white">{p.member_name}</div>
                      {p.member_phone && (
                        <div className="text-[11px] font-mono text-white/40">{p.member_phone}</div>
                      )}
                      {p.note && <div className="text-[11px] text-white/40 italic">{p.note}</div>}
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
                        Du {p.period_start} au <strong className="text-white">{p.period_end}</strong>
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="block text-white/70">
                        {new Date(p.created_at).toLocaleDateString("fr-FR")}
                      </span>
                      <span className="text-[11px] text-white/40">Par {p.recorded_by || "Admin"}</span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedReceipt(p)}
                        className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-white hover:border-lime-400 hover:text-lime-400 transition"
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

      {/* ── MODAL NOUVEAU PAIEMENT ─────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-white/15 bg-[#121212] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-black uppercase text-white">
                Enregistrer un paiement & prolonger
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/50 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
                  <option value="">Sélectionner un membre...</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name} ({m.phone}) — Fin actuelle : {m.end_date}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/70">
                    Montant (FCFA) *
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    required
                    value={amountFcfa}
                    onChange={(e) => setAmountFcfa(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-2.5 text-xs text-white font-mono focus:border-lime-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/70">
                    Moyen de paiement *
                  </label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2.5 text-xs text-white focus:border-lime-400 focus:outline-none"
                  >
                    <option value="Wave">Wave</option>
                    <option value="Orange Money">Orange Money</option>
                    <option value="Espèces">Espèces</option>
                  </select>
                </div>
              </div>

              {/* Raccourcis montants habituels */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] uppercase font-bold text-white/40">Tarifs :</span>
                <button
                  type="button"
                  onClick={() => applyDuration(1, 15000)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-white hover:border-lime-400"
                >
                  1 mois (15k)
                </button>
                <button
                  type="button"
                  onClick={() => applyDuration(3, 40000)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-white hover:border-lime-400"
                >
                  3 mois (40k)
                </button>
                <button
                  type="button"
                  onClick={() => applyDuration(12, 150000)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-white hover:border-lime-400"
                >
                  1 an (150k)
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/70">
                    Période début
                  </label>
                  <input
                    type="date"
                    required
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs text-white focus:border-lime-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/70">
                    Période fin *
                  </label>
                  <input
                    type="date"
                    required
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
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
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-white/15 px-4 py-2.5 text-xs font-bold text-white/70 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-lime-400 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-black hover:bg-lime-300 disabled:opacity-50"
                >
                  {submitting ? "Enregistrement..." : "Confirmer le règlement"}
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
                    {new Date(selectedReceipt.created_at).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Moyen :</span>
                  <span className="font-bold text-white">{selectedReceipt.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Période couverte :</span>
                  <span className="font-mono text-[11px] text-white">
                    {selectedReceipt.period_start} au {selectedReceipt.period_end}
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
              {/* WhatsApp Button */}
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
                    `Période : du ${selectedReceipt.period_start} au ${selectedReceipt.period_end}\n` +
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
