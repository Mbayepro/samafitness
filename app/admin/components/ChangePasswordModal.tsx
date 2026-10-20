"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminEmail: string;
  isDemo: boolean;
  showFeedback: (type: "success" | "error", text: string) => void;
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
  adminEmail,
  isDemo,
  showFeedback,
}: ChangePasswordModalProps) {
  const [supabase] = useState(() => createClient());
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isDemo) {
      setError("Le changement de mot de passe n'est pas actif en mode Démo local (nécessite une session Supabase active).");
      return;
    }

    if (newPassword.length < 8) {
      setError("Le mot de passe doit comporter au moins 8 caractères.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message || "Impossible de mettre à jour le mot de passe.");
      } else {
        showFeedback("success", "Mot de passe modifié avec succès !");
        setNewPassword("");
        setConfirmPassword("");
        onClose();
      }
    } catch {
      setError("Une erreur est survenue lors de la mise à jour du mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#121212] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime-400/10 text-lime-400 font-black text-xs">
              MDP
            </span>
            <div>
              <h2 className="text-base font-black uppercase text-white">Changer de mot de passe</h2>
              <p className="text-xs text-white/50">{adminEmail}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-white/40 hover:bg-white/10 hover:text-white transition"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400"
          >
            <span className="font-bold">!</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/70">
              Nouveau mot de passe
            </label>
            <div className="relative mt-1.5">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 caractères"
                className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white placeholder-white/25 transition focus:border-lime-400 focus:outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40 hover:text-white"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? "Masquer" : "Voir"}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/70">
              Confirmer le mot de passe
            </label>
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Répétez le mot de passe"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white placeholder-white/25 transition focus:border-lime-400 focus:outline-none"
            />
          </div>

          <div className="mt-6 flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-full border border-white/15 py-3 text-xs font-bold uppercase tracking-wider text-white/70 transition hover:bg-white/5"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-full bg-lime-400 py-3 text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-lime-400/20 transition hover:bg-lime-300 disabled:opacity-50"
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
