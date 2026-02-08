export function getClientIp(req: Request): string {
  // Best-effort. Behind proxies you should configure trusted proxies.
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export function asObject(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
}

export function getString(o: Record<string, unknown>, key: string, def = ""): string {
  const v = o[key];
  return typeof v === "string" ? v : def;
}

export function getArray(o: Record<string, unknown>, key: string): unknown[] {
  const v = o[key];
  return Array.isArray(v) ? v : [];
}

export function getStringArray(o: Record<string, unknown>, key: string, max = 200): string[] {
  const arr = getArray(o, key);
  const out: string[] = [];
  for (const v of arr) {
    if (typeof v === "string") out.push(v);
    if (out.length >= max) break;
  }
  return out;
}

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, opts: { windowMs: number; max: number }) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now >= b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return { ok: true, remaining: opts.max - 1, resetAt: now + opts.windowMs };
  }
  if (b.count >= opts.max) return { ok: false, remaining: 0, resetAt: b.resetAt };
  b.count += 1;
  return { ok: true, remaining: opts.max - b.count, resetAt: b.resetAt };
}
