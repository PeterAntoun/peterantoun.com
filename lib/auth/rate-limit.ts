/* Tiny in-memory fixed-window rate limiter for the login route. Good enough
   for a single-user admin on a single serverless region; resets on cold start.
   Keyed by client IP. */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 8;

export function checkRateLimit(key: string): { ok: boolean; retryAfterSec: number } {
  const nowMs = Date.now();
  const b = buckets.get(key);

  if (!b || nowMs > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: nowMs + WINDOW_MS });
    return { ok: true, retryAfterSec: 0 };
  }

  if (b.count >= MAX_ATTEMPTS) {
    return { ok: false, retryAfterSec: Math.ceil((b.resetAt - nowMs) / 1000) };
  }

  b.count += 1;
  return { ok: true, retryAfterSec: 0 };
}

export function resetRateLimit(key: string) {
  buckets.delete(key);
}
