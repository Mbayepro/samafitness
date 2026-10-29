"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Lead } from "@/lib/leads-store";
import type { PaymentMethod } from "@/lib/gym-store";

interface ConvertLeadModalProps {
  lead: Lead;
  onClose: () => void;
  onConfirm: (data: {
    full_name: string;
    phone: string;
    plan_id: string;
    duration_months: number;
    amount_fcfa?: number;
    payment_method?: PaymentMethod;
  }) => Promise<void>;
  showFeedback: (type: "success" | "error", text: string) => void;
}

export default function ConvertLeadModal({
  lead,
  onClose,
  onConfirm,
  showFeedback,
}: ConvertLeadModalProps) {
  const [fullName, setFullName] = useState(lead.name);
  const [phone, setPhone] = useState(lead.phone);
  const [planId, setPlanId] = useState("muscu-cardio");
  const [durationMonths, setDurationMonths] = useState(1);
  const [recordInitialPayment, setRecordInitialPayment] = useState(true);
  const [amountFcfa, setAmountFcfa] = useState(15000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Wave");
  const [submitting, setSubmitting] = useState(false);

  const handleDurationChange = (months: number) => {
    setDurationMonths(months);
    if (months === 1) setAmountFcfa(15000);
    else if (months === 3) setAmountFcfa(40000);
    else if (months === 6) setAmountFcfa(75000);
    else if (months === 12) setAmountFcfa(140000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      showFeedback("error", "Nom et téléphone obligatoires.");
      return;
    }

    setSubmitting(true);
    try {
      await onConfirm({
        full_name: fullName.trim(),
        phone: phone.trim(),
        plan_id: planId,
        duration_months: durationMonths,
        amount_fcfa: recordInitialPayment ? amountFcfa : undefined,
        payment_method: recordInitialPayment ? paymentMethod : undefined,
      });
      showFeedback("success", `Félicitations ! ${fullName} est maintenant inscrit(e) comme membre.`);
      onClose();
    } catch {
      showFeedback("error", "Erreur lors de la conversion du prospect en membre.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-white/15 bg-[#121212] p-6 shadow-2xl text-white">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <span className="rounded-full bg-lime-400/10 border border-lime-400/30 px-2.5 py-0.5 text-[10px] font-black uppercase text-lime-400">
              1-Clic Conversion
            </span>
            <h3 className="mt-1 text-lg font-black uppercase">
              Transformer en Membre du Club
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[6px] p-2 text-white/40 hover:bg-white/10 hover:text-white transition"
            aria-label="Fermer"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/70">
              Nom complet
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-2.5 text-xs text-white focus:border-lime-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/70">
              Téléphone
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-2.5 text-xs text-white focus:border-lime-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/70">
              Formule choisie
            </label>
            <select
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-2.5 text-xs text-white focus:border-lime-400 focus:outline-none"
            >
              <option value="muscu-cardio">Muscu & Cardio (Essentiel)</option>
              <option value="complete">Formule Complète (Tout inclus)</option>
              <option value="coaching">Coaching personnalisé</option>
              <option value="mensuel">Forfait Mensuel</option>
              <option value="trimestriel">Forfait Trimestriel (3 mois)</option>
              <option value="annuel">Forfait Annuel (1 an)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/70">
              Durée initiale de l&apos;adhésion
            </label>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDurationChange(1)}
                className={`rounded-xl border py-2 text-xs font-bold transition ${
                  durationMonths === 1
                    ? "border-lime-400 bg-lime-400 text-black"
                    : "border-white/10 bg-white/5 text-white hover:border-lime-400"
                }`}
              >
                1 Mois
              </button>
              <button
                type="button"
                onClick={() => handleDurationChange(3)}
                className={`rounded-xl border py-2 text-xs font-bold transition ${
                  durationMonths === 3
                    ? "border-lime-400 bg-lime-400 text-black"
                    : "border-white/10 bg-white/5 text-white hover:border-lime-400"
                }`}
              >
                3 Mois
              </button>
              <button
                type="button"
                onClick={() => handleDurationChange(12)}
                className={`rounded-xl border py-2 text-xs font-bold transition ${
                  durationMonths === 12
                    ? "border-lime-400 bg-lime-400 text-black"
                    : "border-white/10 bg-white/5 text-white hover:border-lime-400"
                }`}
              >
                1 An (12 mois)
              </button>
            </div>
          </div>

          {/* Option Paiement Initial */}
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={recordInitialPayment}
                onChange={(e) => setRecordInitialPayment(e.target.checked)}
                className="h-4 w-4 rounded accent-lime-400"
              />
              <span className="text-xs font-bold text-white">
                Encaisser le premier règlement immédiatement
              </span>
            </label>

            {recordInitialPayment && (
              <div className="mt-3 grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-white/50">
                    Montant (FCFA)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    value={amountFcfa}
                    onChange={(e) => setAmountFcfa(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/80 px-3 py-2 text-xs text-white font-mono focus:border-lime-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-white/50">
                    Moyen
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/80 px-3 py-2 text-xs text-white focus:border-lime-400 focus:outline-none"
                  >
                    <option value="Wave">Wave</option>
                    <option value="Orange Money">Orange Money</option>
                    <option value="Espèces">Espèces</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/15 px-4 py-2.5 text-xs font-bold text-white/70 hover:text-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-lime-400 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-black hover:bg-lime-300 disabled:opacity-50"
            >
              {submitting ? "Création..." : "Confirmer l'adhésion"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
