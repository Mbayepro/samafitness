"use client";

import { useEffect, useState, useTransition } from "react";
import { ShieldCheck, UserCheck, X, Sparkles } from "lucide-react";
import {
  listStaffAccountsAction,
  createStaffAccountAction,
  deleteStaffAccountAction,
  type StaffAccount,
} from "@/app/actions/admin-actions";
import type { FeedbackKind } from "@/app/admin/admin-types";
import { formatAdminDate } from "./ui/AdminFormatters";

interface StaffTabProps {
  currentAdminEmail: string;
  showFeedback: (type: FeedbackKind, text: string) => void;
}

export default function StaffTab({ currentAdminEmail, showFeedback }: StaffTabProps) {
  const [staffList, setStaffList] = useState<StaffAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"receptionist" | "super_admin">("receptionist");
  const [showPassword, setShowPassword] = useState(false);

  const loadStaff = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await listStaffAccountsAction();
      if (res.success) {
        setStaffList(res.staff);
      } else {
        setLoadError(res.error || "Impossible de charger les comptes");
        showFeedback("error", res.error);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur de connexion au serveur";
      setLoadError(msg);
      showFeedback("error", msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStaff();
  }, []);

  const generatePassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$%";
    let pwd = "";
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pwd);
    setShowPassword(true);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    startTransition(async () => {
      const res = await createStaffAccountAction({
        email: email.trim().toLowerCase(),
        password,
        role,
      });

      if (res.success) {
        showFeedback("success", `Compte créé avec succès pour ${res.email} !`);
        setIsModalOpen(false);
        setEmail("");
        setPassword("");
        setRole("receptionist");
        void loadStaff();
      } else {
        showFeedback("error", res.error);
      }
    });
  };

  const handleDelete = (targetEmail: string) => {
    if (targetEmail.toLowerCase() === currentAdminEmail.toLowerCase()) {
      showFeedback("error", "Vous ne pouvez pas révoquer votre propre accès administrateur.");
      return;
    }

    if (!window.confirm(`Confirmez-vous la révocation du compte pour ${targetEmail} ?`)) {
      return;
    }

    startTransition(async () => {
      const res = await deleteStaffAccountAction(targetEmail);
      if (res.success) {
        showFeedback("success", `Accès révoqué pour ${targetEmail}.`);
        void loadStaff();
      } else {
        showFeedback("error", res.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Conteneur unifié Équipe */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#121212]">
        {/* En-tête / Barre d'action */}
        <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <h2 className="text-sm font-bold text-white">
              Gestion de l&apos;équipe & comptes gérants
            </h2>
            <p className="mt-0.5 text-xs text-white/50">
              Créez et administrez les accès pour les gérants et réceptionnistes de la salle de Ndioum.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void loadStaff()}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 hover:bg-white/10 transition disabled:opacity-50"
              title="Rafraîchir la liste"
            >
              Actualiser
            </button>
            <button
              type="button"
              onClick={() => {
                generatePassword();
                setIsModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-lime-400 px-3.5 py-2 text-xs font-semibold text-black hover:bg-lime-300 transition"
            >
              <span>+ Créer un compte</span>
            </button>
          </div>
        </div>

        {/* Liste des comptes */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/40 text-xs font-semibold text-white/60">
                <th className="py-3 px-6">Email du compte</th>
                <th className="py-3 px-4">Rôle & permissions</th>
                <th className="py-3 px-4">Date de création</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-white/50">
                    <div className="flex items-center justify-center gap-2.5">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-lime-400 border-t-transparent" />
                      <span>Chargement des comptes de l&apos;équipe...</span>
                    </div>
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center">
                    <div className="flex flex-col items-center justify-center gap-2.5">
                      <p className="text-xs font-medium text-rose-400">{loadError}</p>
                      <button
                        type="button"
                        onClick={() => void loadStaff()}
                        className="rounded-md border border-white/20 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-white/10 transition"
                      >
                        Réessayer
                      </button>
                    </div>
                  </td>
                </tr>
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-white/40">
                    Aucun compte enregistré pour le moment.
                  </td>
                </tr>
              ) : (
                staffList.map((member) => {
                  const isCurrent = member.email.toLowerCase() === currentAdminEmail.toLowerCase();
                  const isSuper = member.role === "super_admin";

                  return (
                    <tr key={member.email} className="transition hover:bg-white/[0.02]">
                      <td className="py-3.5 px-6">
                        <div className="font-semibold text-white flex items-center gap-2">
                          <span>{member.email}</span>
                          {isCurrent && (
                            <span className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-white/70">
                              (Vous)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                            isSuper
                              ? "border border-amber-400/30 bg-amber-400/10 text-amber-300"
                              : "border border-zinc-700 bg-zinc-800/60 text-zinc-300"
                          }`}
                        >
                          {isSuper ? (
                            <>
                              <ShieldCheck size={13} strokeWidth={1.75} className="mr-1.5" />
                              <span>Super Administrateur</span>
                            </>
                          ) : (
                            <>
                              <UserCheck size={13} strokeWidth={1.75} className="mr-1.5" />
                              <span>Gérant / Réceptionniste</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-white/60">
                        {member.created_at ? formatAdminDate(member.created_at) : "—"}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        {!isCurrent && (
                          <button
                            type="button"
                            onClick={() => handleDelete(member.email)}
                            disabled={isPending}
                            className="rounded-md border border-red-500/25 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
                          >
                            Révoquer
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modale de création d'un compte gérant */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl border border-white/15 bg-[#121212] p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Nouveau compte gérant</h3>
                <p className="mt-0.5 text-xs text-white/50">
                  Créez des identifiants sécurisés pour le personnel de la salle.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Fermer"
                className="rounded-md p-1.5 text-white/40 hover:text-white transition"
              >
                <X size={16} strokeWidth={1.75} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/70">
                  Email professionnel *
                </label>
                <input
                  type="email"
                  required
                  placeholder="gerant@sambafitness.sn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-xs text-white placeholder-white/30 focus:border-white/30 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-white/70">
                    Mot de passe initial *
                  </label>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 hover:underline"
                  >
                    <Sparkles size={12} strokeWidth={1.75} />
                    <span>Générer automatiquement</span>
                  </button>
                </div>
                <div className="relative mt-1.5">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-xs text-white font-mono focus:border-white/30 focus:outline-none pr-16"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-white/40 hover:text-white"
                  >
                    {showPassword ? "Masquer" : "Voir"}
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-white/40">
                  Au moins 8 caractères. Transmettez ce mot de passe au gérant de confiance.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70">
                  Rôle & niveau d&apos;accès
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as "receptionist" | "super_admin")}
                  className="mt-1.5 w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-xs text-white focus:border-white/30 focus:outline-none"
                >
                  <option value="receptionist">
                    Gérant / Réceptionniste (Accès Membres, Pointage, Paiements, Relances)
                  </option>
                  <option value="super_admin">
                    Super Administrateur (Accès complet + gestion de l&apos;équipe)
                  </option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-md border border-white/15 px-3.5 py-2 text-xs font-medium text-white/70 hover:text-white transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-md bg-lime-400 px-4 py-2 text-xs font-semibold text-black hover:bg-lime-300 transition disabled:opacity-50"
                >
                  {isPending ? "Création..." : "Créer le compte gérant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
