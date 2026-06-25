const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit = 8, windowMs = 60_000) {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (current.count >= limit) {
    return { allowed: false };
  }

  current.count += 1;
  return { allowed: true };
}

export function getClientKey(request: Request, namespace: string) {
  const forwardedFor = request.headers.get("x-forwarded-for") || "unknown";
  return `${namespace}:${forwardedFor.split(",")[0].trim()}`;
}
