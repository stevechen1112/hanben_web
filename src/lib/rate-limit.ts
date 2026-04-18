type Bucket = {
  count: number;
  resetAt: number;
};

const store = new Map<string, Bucket>();

export function getRequestIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export function rateLimit(
  key: string,
  options: {
    limit: number;
    windowMs: number;
  },
) {
  const now = Date.now();
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + options.windowMs });
    return { success: true, remaining: options.limit - 1, resetAt: now + options.windowMs };
  }

  if (current.count >= options.limit) {
    return { success: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  store.set(key, current);
  return { success: true, remaining: options.limit - current.count, resetAt: current.resetAt };
}