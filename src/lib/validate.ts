// Small input checks used by the sign up / login / admin forms.
export function text(v: FormDataEntryValue | null, max = 200) {
  return String(v ?? "").trim().slice(0, max);
}

export function isEmail(v: string) {
  return v.length <= 120 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}

/** Returns digits only (10 digits, or with country code 91...) or null. */
export function cleanPhone(v: string) {
  const d = v.replace(/[^\d]/g, "");
  if (d.length === 10) return d;
  if (d.length >= 11 && d.length <= 13) return d;
  return null;
}

/** Only allow going to pages inside our own site after login. */
export function safeNext(v: string | null | undefined) {
  if (!v || !v.startsWith("/") || v.startsWith("//") || v.includes("\\")) return "/account";
  return v;
}

/**
 * Small in-memory brake against abuse (password guessing, signup floods, order spam).
 * Note: this lives in one server instance's memory, so on Vercel each instance has
 * its own counter. It stops casual abuse, not a determined distributed attack.
 * For that, put Vercel's WAF / rate limiting in front of the site.
 */
type Hit = { n: number; until: number };
const buckets = new Map<string, Map<string, Hit>>();

function bucket(name: string) {
  let b = buckets.get(name);
  if (!b) {
    b = new Map();
    buckets.set(name, b);
  }
  // keep memory bounded: drop expired entries once the map gets large
  if (b.size > 5000) {
    const now = Date.now();
    for (const [k, v] of b) if (v.until < now) b.delete(k);
  }
  return b;
}

/** true when `key` has already gone over `max` events in the current window */
export function overLimit(name: string, key: string, max: number) {
  const t = bucket(name).get(key);
  return !!t && t.n >= max && t.until > Date.now();
}

/** record one event; returns true when that event puts the key over the limit */
export function noteHit(name: string, key: string, max: number, windowMs: number) {
  const b = bucket(name);
  const now = Date.now();
  const t = b.get(key);
  if (!t || t.until < now) {
    b.set(key, { n: 1, until: now + windowMs });
    return max <= 1;
  }
  t.n += 1;
  return t.n >= max;
}

export function clearHits(name: string, key: string) {
  bucket(name).delete(key);
}

// --- login brake (kept as named helpers so the login code reads clearly)
const LOGIN_MAX = 8;
const LOGIN_WINDOW = 15 * 60_000;
export function tooManyTries(key: string) {
  return overLimit("login", key, LOGIN_MAX);
}
export function noteFailure(key: string) {
  noteHit("login", key, LOGIN_MAX, LOGIN_WINDOW);
}
export function clearFailures(key: string) {
  clearHits("login", key);
}
