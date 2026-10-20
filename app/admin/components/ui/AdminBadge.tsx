import React from "react";

export type AdminBadgeVariant = "success" | "warning" | "danger" | "neutral" | "brand";

interface AdminBadgeProps {
  variant?: AdminBadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<AdminBadgeVariant, string> = {
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
  warning: "bg-amber-500/10 text-amber-300 border-amber-500/25",
  danger: "bg-red-500/10 text-red-400 border-red-500/25",
  neutral: "bg-white/[0.04] text-zinc-300 border-white/10",
  brand: "bg-[#a3e635]/10 text-[#a3e635] border-[#a3e635]/25",
};

const dotColors: Record<AdminBadgeVariant, string> = {
  success: "bg-emerald-400",
  warning: "bg-amber-400",
  danger: "bg-red-400",
  neutral: "bg-zinc-400",
  brand: "bg-[#a3e635]",
};

export function AdminBadge({
  variant = "neutral",
  children,
  dot = false,
  className = "",
}: AdminBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[6px] border px-2 py-0.5 text-xs font-medium leading-none tracking-normal transition-colors ${variantStyles[variant]} ${className}`}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${dotColors[variant]}`}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </span>
  );
}

/**
 * Aide pour convertir un statut membre/paiement/lead en variante d'AdminBadge.
 */
export function getMemberStatusBadge(status: string): {
  variant: AdminBadgeVariant;
  label: string;
} {
  switch (status) {
    case "actif":
      return { variant: "success", label: "Actif" };
    case "expire_bientot":
      return { variant: "warning", label: "Expire bientôt" };
    case "expire":
      return { variant: "danger", label: "Expiré" };
    case "nouveau":
      return { variant: "warning", label: "Nouveau" };
    case "contacté":
      return { variant: "neutral", label: "Contacté" };
    case "inscrit":
      return { variant: "success", label: "Inscrit" };
    case "archive":
      return { variant: "neutral", label: "Archivé" };
    default:
      return { variant: "neutral", label: status };
  }
}
