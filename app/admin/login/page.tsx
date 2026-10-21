"use client";

import { useState, useEffect } from "react";
import { Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { enterDemoModeAction, verifyLoginRateLimitAction } from "@/app/actions/auth-actions";

const IS_DEV = process.env.NODE_ENV === "development";

export default function AdminLoginPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = new URLSearchParams(window.location.search).get("error");
    if (errorParam) {
      setAuthError(errorParam);
    }
  }, []);
  const [authLoading, setAuthLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const goToAdmin = () => {
    window.location.href = "/admin";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    const rateCheck = await verifyLoginRateLimitAction();
    if (!rateCheck.allowed) {
      setAuthError(rateCheck.error ?? "Trop de tentatives de connexion.");
      setAuthLoading(false);
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (error) {
        setAuthError(
          error.message === "Invalid login credentials"
            ? "Identifiants incorrects. Vérifiez votre email et mot de passe, ou confirmez que votre compte est configuré."
            : error.message || "Identifiants incorrects."
        );
      } else if (data.session) {
        goToAdmin();
        return;
      }
    } catch {
      setAuthError("Erreur de connexion. Vérifiez la configuration Supabase.");
    }
    setAuthLoading(false);
  };

  const handleDemo = async () => {
    setDemoLoading(true);
    const res = await enterDemoModeAction();
    if (res.success) {
      goToAdmin();
    } else {
      setAuthError(res.error ?? "Mode démo indisponible.");
      setDemoLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-[#080808] px-6 py-12 text-white">
      <div className="mx-auto w-full max-w-md">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-3xl font-black tracking-tight">
            <span>SAMBA</span>
            <span className="text-lime-400">FITNESS</span>
            <span className="ml-2 rounded-full border border-lime-400/40 bg-lime-400/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-lime-400">
              Admin
            </span>
          </Link>
          <h1 className="mt-6 text-2xl font-black uppercase text-white">Connexion Espace Gestion</h1>
          <p className="mt-2 text-xs text-white/50">
            Accès sécurisé pour l&apos;équipe administrative et les gérants du club.
          </p>
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-[#121212] p-8 shadow-2xl backdrop-blur-xl">
          {authError && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs font-medium text-red-400"
            >
              <span className="mt-0.5 font-bold">!</span>
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="admin-email" className="block text-xs font-bold uppercase tracking-wider text-white/70">
                Email professionnel
              </label>
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                placeholder="gerant@sambafitness.sn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3.5 text-sm text-white placeholder-white/30 transition focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-xs font-bold uppercase tracking-wider text-white/70">
                Mot de passe
              </label>
              <input
                id="admin-password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3.5 text-sm text-white placeholder-white/30 transition focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
              />
            </div>

            <button
              id="admin-submit-login"
              type="submit"
              disabled={authLoading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-lime-400 py-3.5 px-4 text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-lime-400/20 transition hover:bg-lime-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {authLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  <span>Vérification...</span>
                </>
              ) : (
                <span>Se connecter</span>
              )}
            </button>
          </form>

          {IS_DEV && (
            <div className="mt-6 border-t border-white/10 pt-6">
              <p className="text-center text-[11px] text-white/40 mb-3">
                Environnement de développement local
              </p>
              <button
                type="button"
                onClick={handleDemo}
                disabled={demoLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-[8px] border border-white/20 bg-white/5 py-2.5 px-4 text-xs font-medium text-white/80 transition hover:bg-white/10 hover:text-white disabled:opacity-50 min-h-[40px]"
              >
                {demoLoading ? (
                  "Chargement..."
                ) : (
                  <>
                    <Zap size={16} strokeWidth={1.75} />
                    <span>Accéder en mode démo local</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-white/40">
          <Link href="/" className="transition hover:text-lime-400">
            ← Retour au site public
          </Link>
        </p>
      </div>
    </div>
  );
}
