"use server";

import { sheetsConfigured, ensureSheets } from "@/lib/sheets";
import { sessionConfigured } from "@/lib/token";
import { createUser, findUserByEmail, findUserById, normalizeEmail, updateUserProfile, verifyLogin } from "@/lib/users";
import { endSession, getSession, startSession } from "@/lib/session";
import { addOrder } from "@/lib/orders";
import { clearFailures, cleanPhone, isEmail, noteFailure, text, tooManyTries } from "@/lib/validate";
import type { FormState } from "@/types/forms";

const NOT_READY: FormState = {
  ok: false,
  error: "Accounts are not switched on yet. The shop owner still needs to finish the Google Sheet setup.",
};

function ready() {
  return sheetsConfigured() && sessionConfigured();
}

export async function signupAction(_prev: FormState, fd: FormData): Promise<FormState> {
  if (!ready()) return NOT_READY;

  const name = text(fd.get("name"), 60);
  const email = normalizeEmail(text(fd.get("email"), 120));
  const phone = cleanPhone(text(fd.get("phone"), 20) ?? "");
  const password = String(fd.get("password") ?? "");
  const fields = { name, email, phone: text(fd.get("phone"), 20) };

  if (name.length < 2) return { ok: false, fields, error: "Please enter your name." };
  if (!isEmail(email)) return { ok: false, fields, error: "Please enter a valid email address." };
  if (!phone) return { ok: false, fields, error: "Please enter a valid 10-digit mobile number." };
  if (password.length < 8) return { ok: false, fields, error: "Password must be at least 8 characters." };
  if (password.length > 72) return { ok: false, fields, error: "Password is too long (max 72 characters)." };

  try {
    await ensureSheets();
    if (await findUserByEmail(email)) {
      return { ok: false, fields, error: "An account with this email already exists. Please log in." };
    }
    const user = await createUser({ name, email, phone, password });
    await startSession({ uid: user.uid, name: user.name, email: user.email, phone: user.phone, role: user.role });
    return { ok: true };
  } catch (e) {
    console.error("[signup]", e);
    return { ok: false, fields, error: "Something went wrong. Please try again in a moment." };
  }
}

export async function loginAction(_prev: FormState, fd: FormData): Promise<FormState> {
  if (!ready()) return NOT_READY;

  const email = normalizeEmail(text(fd.get("email"), 120));
  const password = String(fd.get("password") ?? "");
  const fields = { email };
  if (!isEmail(email) || !password) return { ok: false, fields, error: "Enter your email and password." };

  if (tooManyTries(email)) {
    return { ok: false, fields, error: "Too many wrong attempts. Please wait 15 minutes and try again." };
  }

  try {
    const user = await verifyLogin(email, password);
    if (!user) {
      noteFailure(email);
      return { ok: false, fields, error: "Wrong email or password." };
    }
    clearFailures(email);
    await startSession({ uid: user.uid, name: user.name, email: user.email, phone: user.phone, role: user.role });
    return { ok: true };
  } catch (e) {
    console.error("[login]", e);
    return { ok: false, fields, error: "Something went wrong. Please try again in a moment." };
  }
}

export async function logoutAction(): Promise<void> {
  await endSession();
}

export async function updateProfileAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const me = await getSession();
  if (!me) return { ok: false, error: "Please log in again." };

  const name = text(fd.get("name"), 60);
  const phone = cleanPhone(text(fd.get("phone"), 20) ?? "");
  if (name.length < 2) return { ok: false, error: "Please enter your name." };
  if (!phone) return { ok: false, error: "Please enter a valid 10-digit mobile number." };

  try {
    const record = await findUserById(me.uid);
    if (!record) return { ok: false, error: "Account not found. Please log in again." };
    await updateUserProfile(record, name, phone);
    await startSession({ ...me, name, phone, role: record.role });
    return { ok: true, message: "Saved." };
  } catch (e) {
    console.error("[profile]", e);
    return { ok: false, error: "Could not save. Please try again." };
  }
}

type OrderLine = { name: string; variant?: string; qty: number; price: number };

/** Saves the order in the sheet when the customer taps "Checkout on WhatsApp". */
export async function logOrderAction(lines: OrderLine[]): Promise<{ ok: boolean }> {
  const me = await getSession();
  if (!me || !sheetsConfigured() || !Array.isArray(lines) || lines.length === 0) return { ok: false };

  const clean = lines.slice(0, 40).map((l) => ({
    name: String(l.name ?? "").slice(0, 80),
    variant: l.variant ? String(l.variant).slice(0, 60) : "",
    qty: Math.min(99, Math.max(1, Math.floor(Number(l.qty) || 1))),
    price: Math.max(0, Math.round(Number(l.price) || 0)),
  }));
  const total = clean.reduce((sum, l) => sum + l.price * l.qty, 0);
  const items = clean
    .map((l, i) => `${i + 1}. ${l.name}${l.variant ? ` (${l.variant})` : ""} x ${l.qty} = Rs ${l.price * l.qty}`)
    .join("\n");

  try {
    await addOrder({ userId: me.uid, name: me.name, email: me.email, phone: me.phone, items, total });
    return { ok: true };
  } catch (e) {
    console.error("[order]", e);
    return { ok: false };
  }
}
