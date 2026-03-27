type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

type Bucket = {
  count: number;
  resetAtMs: number;
};

const buckets = new Map<string, Bucket>();

function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }
  return headers.get('x-real-ip') ?? 'unknown';
}

function getBucketKey(routeKey: string, ip: string): string {
  return `${routeKey}:${ip}`;
}

export function checkRateLimit(
  headers: Headers,
  routeKey: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const ip = getClientIp(headers);
  const key = getBucketKey(routeKey, ip);
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAtMs) {
    buckets.set(key, {
      count: 1,
      resetAtMs: now + windowMs,
    });
    return { allowed: true, retryAfterSeconds: Math.ceil(windowMs / 1000) };
  }

  if (existing.count >= maxRequests) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAtMs - now) / 1000)),
    };
  }

  existing.count += 1;
  buckets.set(key, existing);
  return {
    allowed: true,
    retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAtMs - now) / 1000)),
  };
}
