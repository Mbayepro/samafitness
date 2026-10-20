import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAdminFeedback } from "./useAdminFeedback";

describe("useAdminFeedback", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("démarre avec un feedback null", () => {
    const { result } = renderHook(() => useAdminFeedback());
    expect(result.current.feedback).toBeNull();
  });

  it("affiche un message de succès puis disparaît après expiration", () => {
    const { result } = renderHook(() => useAdminFeedback(2000));

    act(() => {
      result.current.showFeedback("success", "Opération réussie");
    });

    expect(result.current.feedback).toEqual({
      type: "success",
      text: "Opération réussie",
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.feedback).toBeNull();
  });

  it("clearFeedback réinitialise immédiatement le message", () => {
    const { result } = renderHook(() => useAdminFeedback(5000));

    act(() => {
      result.current.showFeedback("error", "Erreur réseau");
    });

    expect(result.current.feedback).toEqual({
      type: "error",
      text: "Erreur réseau",
    });

    act(() => {
      result.current.clearFeedback();
    });

    expect(result.current.feedback).toBeNull();
  });
});
