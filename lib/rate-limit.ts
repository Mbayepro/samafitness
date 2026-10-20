export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
}

export interface RateLimitRule {
  limit: number;
  windowMs: number;
}

const buckets = new Map<string, number[]>();

/** Règles métier demandées : login 5 / 15 min, contact 3 / heure. */
export const RATE_LIMITS = {
  login: { limit: 5, windowMs: 15 * 60 * 1000 } satisfies RateLimitRule,
  contact: { limit: 3, windowMs: 60 * 60 * 1000 } satisfies RateLimitRule,
};

export function getClientIp(headersList: Headers): string {
  const forwarded = headersList.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return headersList.get("x-real-ip")?.trim() || headersList.get("cf-connecting-ip")?.trim() || "unknown";
}

/**
 * Limiteur en mémoire (fenêtre glissante).
 * Suffisant en instance unique / dev. En multi-instance, brancher Upstash.
 */
export function checkRateLimit(key: string, rule: RateLimitRule, now = Date.now()): RateLimitResult {
  const windowStart = now - rule.windowMs;
  const previous = buckets.get(key) ?? [];
  const recent = previous.filter((ts) => ts > windowStart);

  if (recent.length >= rule.limit) {
    buckets.set(key, recent);
    const retryAfterSec = Math.max(1, Math.ceil((recent[0] + rule.windowMs - now) / 1000));
    return { allowed: false, remaining: 0, retryAfterSec };
  }

  recent.push(now);
  buckets.set(key, recent);
  return { allowed: true, remaining: rule.limit - recent.length, retryAfterSec: 0 };
}

export function rateLimitMessage(kind: "login" | "contact", result: RateLimitResult): string {
  const minutes = Math.max(1, Math.ceil(result.retryAfterSec / 60));
  if (kind === "login") {
    return `Trop de tentatives de connexion. Réessayez dans ${minutes} min.`;
  }
  return `Trop de demandes d'inscription. Réessayez dans ${minutes} min.`;
}

/** Réservé aux tests unitaires. */
export function resetRateLimitStore(): void {
  buckets.clear();
}
