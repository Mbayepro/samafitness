"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AccessDenied({ email }: { email: string }) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignorer
    }
    router.push("/admin/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080808] px-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-[#121212] p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[8px] border border-red-500/20 bg-red-500/10 text-red-400">
          <ShieldAlert size={24} strokeWidth={1.75} />
        </div>
        <h1 className="mt-4 text-xl font-black uppercase">Accès refusé</h1>
        <p className="mt-3 text-sm text-white/60">
          Le compte <strong className="text-white">{email}</strong> n&apos;est pas autorisé à
          accéder au panneau d&apos;administration.
        </p>
        <p className="mt-2 text-xs text-white/40">
          Demandez au super-administrateur d&apos;ajouter votre email dans la liste des administrateurs.
        </p>
        <button
          id="admin-denied-logout"
          type="button"
          onClick={handleLogout}
          disabled={loading}
          className="mt-6 w-full rounded-full bg-lime-400 py-3 text-xs font-black uppercase tracking-wider text-black transition hover:bg-lime-300 disabled:opacity-50"
        >
          {loading ? "Déconnexion..." : "Changer de compte"}
        </button>
        <Link href="/" className="mt-4 inline-block text-xs text-white/50 hover:text-lime-400">
          ← Retour au site
        </Link>
      </div>
    </div>
  );
}
