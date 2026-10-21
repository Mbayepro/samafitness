"use client";

import type { AdminFeedback } from "@/app/admin/admin-types";
import { Check, AlertCircle } from "lucide-react";

export default function AdminFeedbackToast({ feedback }: { feedback: AdminFeedback }) {
  if (!feedback) return null;

  const isSuccess = feedback.type === "success";

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-[8px] border border-[#23272d] bg-[#111315] px-4 py-3 text-xs font-medium text-[#f0f2f5] shadow-lg animate-fade-in"
    >
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-[4px] ${
          isSuccess
            ? "bg-emerald-500/15 text-emerald-400"
            : "bg-red-500/15 text-red-400"
        }`}
      >
        {isSuccess ? <Check size={13} strokeWidth={2.5} /> : <AlertCircle size={13} strokeWidth={2.5} />}
      </span>
      <span>{feedback.text}</span>
    </div>
  );
}

