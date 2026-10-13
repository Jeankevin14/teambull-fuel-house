// Reads / writes the login cookie and guards pages. Server-side only.
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, SESSION_DAYS, readSession, signSession } from "@/lib/token";
import { findUserById } from "@/lib/users";
import type { Me } from "@/types";

export async function getSession(): Promise<Me | null> {
  const store = await cookies();
  return readSession(store.get(SESSION_COOKIE)?.value);
}

export async function startSession(me: Me) {
  const store = await cookies();
  store.set(SESSION_COOKIE, await signSession(me), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * SESSION_DAYS,
  });
}

export async function endSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** For pages: must be logged in, otherwise go to the login page. */
export async function requireUser(next: string): Promise<Me> {
  const me = await getSession();
  if (!me) redirect(`/login?next=${encodeURIComponent(next)}`);
  return me;
}

/**
 * Admin check, done on the server every time:
 * the person must be logged in AND their row in the Google Sheet "Users" tab
 * must have the word  admin  in the role column (only YOU can type that in the sheet).
 */
export async function getAdmin(): Promise<Me | null> {
  const me = await getSession();
  if (!me) return null;
  const record = await findUserById(me.uid);
  if (!record || record.role !== "admin") return null;
  return { uid: record.uid, name: record.name, email: record.email, phone: record.phone, role: "admin" };
}

export async function requireAdmin(): Promise<Me> {
  const me = await getSession();
  if (!me) redirect("/login?next=%2Fadmin");
  const admin = await getAdmin();
  if (!admin) redirect("/");
  return admin;
}

/** For server actions: throws if the caller is not an admin. */
export async function assertAdmin(): Promise<Me> {
  const admin = await getAdmin();
  if (!admin) throw new Error("Not allowed.");
  return admin;
}
