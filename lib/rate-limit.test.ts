import { describe, it, expect, beforeEach } from "vitest";
import {
  checkRateLimit,
  getClientIp,
  rateLimitMessage,
  resetRateLimitStore,
} from "./rate-limit";

describe("rate-limit", () => {
  beforeEach(() => {
    resetRateLimitStore();
  });

  it("autorise jusqu'à la limite puis bloque", () => {
    const rule = { limit: 3, windowMs: 60_000 };
    expect(checkRateLimit("k", rule, 1_000).allowed).toBe(true);
    expect(checkRateLimit("k", rule, 2_000).allowed).toBe(true);
    expect(checkRateLimit("k", rule, 3_000).allowed).toBe(true);
    const blocked = checkRateLimit("k", rule, 4_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });

  it("réouvre la fenêtre une fois expirée", () => {
    const rule = { limit: 1, windowMs: 1_000 };
    expect(checkRateLimit("k", rule, 0).allowed).toBe(true);
    expect(checkRateLimit("k", rule, 500).allowed).toBe(false);
    expect(checkRateLimit("k", rule, 1_001).allowed).toBe(true);
  });

  it("isole les clés", () => {
    const rule = { limit: 1, windowMs: 60_000 };
    expect(checkRateLimit("a", rule).allowed).toBe(true);
    expect(checkRateLimit("b", rule).allowed).toBe(true);
    expect(checkRateLimit("a", rule).allowed).toBe(false);
  });

  it("extrait l'IP depuis x-forwarded-for", () => {
    const headers = new Headers({ "x-forwarded-for": "  1.2.3.4, 10.0.0.1" });
    expect(getClientIp(headers)).toBe("1.2.3.4");
  });

  it("compose un message clair", () => {
    const msg = rateLimitMessage("login", {
      allowed: false,
      remaining: 0,
      retryAfterSec: 120,
    });
    expect(msg).toContain("connexion");
    expect(msg).toContain("2 min");
  });
});
