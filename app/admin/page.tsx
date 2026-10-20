import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAuthState } from "@/lib/auth/admin";
import AdminDashboard from "./AdminDashboard";
import AccessDenied from "./AccessDenied";

// La page lit la session à chaque requête : pas de validation « instant navigation ».
export const instant = false;

export default function AdminPage() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <AdminGate />
    </Suspense>
  );
}

/** Vérification serveur : session Supabase + présence dans admin_whitelist. */
async function AdminGate() {
  const state = await getAuthState();

  if (state.status === "anonymous") {
    redirect("/admin/login");
  }
  if (state.status === "forbidden") {
    return <AccessDenied email={state.email} />;
  }
  return <AdminDashboard admin={state.admin} />;
}

function AdminLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080808] text-white">
      <div className="flex items-center gap-3">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-lime-400 border-t-transparent" />
        <span className="text-sm font-semibold text-white/70">
          Chargement de l&apos;espace administrateur...
        </span>
      </div>
    </div>
  );
}
