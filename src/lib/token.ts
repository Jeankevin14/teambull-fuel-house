// Signed login cookie (JWT). Pure helpers, no Next imports.
import { SignJWT, jwtVerify } from "jose";
import type { Me } from "@/types";
// Safety net: this file handles logins and secrets and must never be bundled
// into the browser. If it ever is, fail loudly instead of leaking.
if (typeof window !== "undefined") {
  throw new Error("token.ts must only be used on the server.");
}


export const SESSION_COOKIE = "tfh-session";
export const SESSION_DAYS = 30;

function secretKey() {
  let secret = process.env.SESSION_SECRET?.trim();
  if (!secret) {
    if (process.env.NODE_ENV === "production") return null;
    secret = "dev-only-secret-change-me-dev-only-secret";
  }
  if (secret.length < 24) return null;
  return new TextEncoder().encode(secret);
}

export function sessionConfigured() {
  return secretKey() !== null;
}

export async function signSession(me: Me): Promise<string> {
  const key = secretKey();
  if (!key) throw new Error("SESSION_SECRET is missing or too short.");
  return new SignJWT({ ...me })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(key);
}

export async function readSession(token: string | undefined): Promise<Me | null> {
  const key = secretKey();
  if (!token || !key) return null;
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    if (typeof payload.uid !== "string" || typeof payload.email !== "string") return null;
    return {
      uid: payload.uid,
      email: payload.email,
      name: String(payload.name ?? ""),
      phone: String(payload.phone ?? ""),
      role: payload.role === "admin" ? "admin" : "customer",
    };
  } catch {
    return null;
  }
}
