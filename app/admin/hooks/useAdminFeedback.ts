"use client";

import { useCallback, useRef, useState } from "react";
import type { AdminFeedback, FeedbackKind } from "@/app/admin/admin-types";

export function useAdminFeedback(durationMs = 4000) {
  const [feedback, setFeedback] = useState<AdminFeedback>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showFeedback = useCallback(
    (type: FeedbackKind, text: string) => {
      setFeedback({ type, text });
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setFeedback(null), durationMs);
    },
    [durationMs]
  );

  const clearFeedback = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setFeedback(null);
  }, []);

  return { feedback, showFeedback, clearFeedback };
}
