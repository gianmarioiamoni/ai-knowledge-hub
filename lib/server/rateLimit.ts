// lib/server/rateLimit.ts
const windowStore = new Map<string, { count: number; resetAt: number }>();

type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

const rateLimit = (key: string, { limit, windowMs }: RateLimitOptions): RateLimitResult => {
  const now = Date.now();
  const existing = windowStore.get(key);

  if (!existing || existing.resetAt <= now) {
    windowStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  windowStore.set(key, existing);
  return { allowed: true, remaining: limit - existing.count, resetAt: existing.resetAt };
};

export type { RateLimitResult };
export { rateLimit };

