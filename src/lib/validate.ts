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

// very small in-memory brake against password guessing (per server instance)
const tries = new Map<string, { n: number; until: number }>();
export function tooManyTries(key: string) {
  const t = tries.get(key);
  return !!t && t.n >= 8 && t.until > Date.now();
}
export function noteFailure(key: string) {
  const now = Date.now();
  const t = tries.get(key);
  if (!t || t.until < now) tries.set(key, { n: 1, until: now + 15 * 60_000 });
  else t.n += 1;
}
export function clearFailures(key: string) {
  tries.delete(key);
}
