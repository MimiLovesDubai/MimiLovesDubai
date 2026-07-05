/**
 * Simple in-memory sliding-window rate limiter (per server instance).
 * Good enough as a basic guard for the MVP; swap for Upstash/Redis when
 * scaling to multiple serverless instances.
 */
const hits = new Map<string, number[]>();

export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= max) {
    hits.set(key, arr);
    return { ok: false as const, retryAfterMs: windowMs - (now - arr[0]) };
  }
  arr.push(now);
  hits.set(key, arr);
  return { ok: true as const, retryAfterMs: 0 };
}
