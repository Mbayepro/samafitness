"use client";

import type { AdminFeedback } from "@/app/admin/admin-types";

export default function AdminFeedbackToast({ feedback }: { feedback: AdminFeedback }) {
  if (!feedback) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border border-white/20 bg-black/95 px-5 py-3 text-xs font-bold shadow-2xl backdrop-blur-xl animate-fade-in"
    >
      {feedback.type === "success" ? (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-lime-400 text-black text-[11px] font-black">
          ✓
        </span>
      ) : (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-[11px] font-black">
          !
        </span>
      )}
      <span>{feedback.text}</span>
    </div>
  );
}
