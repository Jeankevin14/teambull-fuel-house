"use server";

import { sheetsConfigured, ensureSheets } from "@/lib/sheets";
import { sessionConfigured } from "@/lib/token";
import { createUser, findUserByEmail, findUserById, normalizeEmail, updateUserProfile, verifyLogin } from "@/lib/users";
import { endSession, getSession, startSession } from "@/lib/session";
import { addOrder } from "@/lib/orders";
import { clearFailures, cleanPhone, isEmail, noteFailure, noteHit, overLimit, text, tooManyTries } from "@/lib/validate";
import { findProduct } from "@/lib/catalog";
import { priceFor } from "@/lib/products";
import type { FormState } from "@/types/forms";

const NOT_READY: FormState = {
  ok: false,
  error: "Accounts are not switched on yet. The shop owner still needs to finish the Google Sheet setup.",
};

function ready() {
  return sheetsConfigured() && sessionConfigured();
}

const SIGNUP_MAX_PER_HOUR = 20;
const ORDERS_MAX_PER_HOUR = 30;

export async function signupAction(_prev: FormState, fd: FormData): Promise<FormState> {
  if (!ready()) return NOT_READY;
  // stop one person mass-creating accounts and filling the sheet
  if (overLimit("signup", "all", SIGNUP_MAX_PER_HOUR)) {
    return { ok: false, error: "Too many new accounts just now. Please try again later." };
  }

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
    noteHit("signup", "all", SIGNUP_MAX_PER_HOUR, 60 * 60_000);
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

type OrderLine = { id?: number; name: string; variant?: string; qty: number; price: number };

/**
 * Saves the order in the sheet when the customer taps "Checkout on WhatsApp".
 * Prices are looked up on the server from the catalogue, so a tampered browser
 * cannot record an order at a price you never set.
 */
export async function logOrderAction(lines: OrderLine[]): Promise<{ ok: boolean }> {
  const me = await getSession();
  if (!me || !sheetsConfigured() || !Array.isArray(lines) || lines.length === 0) return { ok: false };
  if (overLimit("order", me.uid, ORDERS_MAX_PER_HOUR)) return { ok: false };
  noteHit("order", me.uid, ORDERS_MAX_PER_HOUR, 60 * 60_000);

  const clean: { name: string; variant: string; qty: number; price: number }[] = [];
  for (const l of lines.slice(0, 40)) {
    const qty = Math.min(99, Math.max(1, Math.floor(Number(l.qty) || 1)));
    const variant = l.variant ? String(l.variant).slice(0, 60) : "";
    const id = Math.floor(Number(l.id));
    const product = Number.isInteger(id) && id > 0 ? await findProduct(id) : undefined;
    if (!product) continue; // unknown product: never record a price we cannot verify
    // the variant reads like "Chocolate · 2kg": find which of our sizes it names
    const size = product.sizes?.find((sz) => variant.includes(sz.label))?.label;
    clean.push({ name: product.name.slice(0, 80), variant, qty, price: priceFor(product, size) });
  }
  if (clean.length === 0) return { ok: false };

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
