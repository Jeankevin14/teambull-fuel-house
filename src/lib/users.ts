// Customer accounts, stored in the "Users" tab of your Google Sheet.
// Passwords are NEVER saved as text: only a scrambled (bcrypt hashed) version.
import bcrypt from "bcryptjs";
import { appendRow, readTab, updateRow } from "@/lib/sheets";
import type { Me } from "@/types";
// Safety net: this file handles logins and secrets and must never be bundled
// into the browser. If it ever is, fail loudly instead of leaking.
if (typeof window !== "undefined") {
  throw new Error("users.ts must only be used on the server.");
}


export type UserRecord = Me & { passwordHash: string; createdAt: string; row: number };

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function toRecord(r: Record<string, string> & { _row: number }): UserRecord {
  return {
    uid: r.id,
    name: r.name,
    email: normalizeEmail(r.email ?? ""),
    phone: r.phone ?? "",
    passwordHash: r.passwordHash ?? "",
    role: (r.role ?? "").trim().toLowerCase() === "admin" ? "admin" : "customer",
    createdAt: r.createdAt ?? "",
    row: r._row,
  };
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const e = normalizeEmail(email);
  const rows = await readTab("Users");
  const hit = rows.find((r) => normalizeEmail(r.email ?? "") === e);
  return hit ? toRecord(hit) : null;
}

export async function findUserById(uid: string): Promise<UserRecord | null> {
  const rows = await readTab("Users");
  const hit = rows.find((r) => r.id === uid);
  return hit ? toRecord(hit) : null;
}

export async function countUsers() {
  // customers only: admin accounts are not counted
  return (await readTab("Users")).filter((r) => (r.role ?? "").trim().toLowerCase() !== "admin").length;
}

export async function createUser(input: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<UserRecord> {
  const passwordHash = await bcrypt.hash(input.password, 10);
  const id = `U${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const createdAt = new Date().toISOString();
  const record = {
    id,
    name: input.name,
    email: normalizeEmail(input.email),
    phone: input.phone,
    passwordHash,
    role: "customer",
    createdAt,
  };
  await appendRow("Users", record);
  const created = await findUserByEmail(input.email);
  if (!created) throw new Error("Could not save the account.");
  return created;
}

// compared against when the email does not exist, so timing does not reveal accounts
const DUMMY_HASH = "$2b$10$CwTycUXWue0Thq9StjUM0uJ8e1p0e2l1b5G9m0f5xQ1h3J6q9bC3e";

export async function verifyLogin(email: string, password: string): Promise<UserRecord | null> {
  const user = await findUserByEmail(email);
  const ok = await bcrypt.compare(password, user?.passwordHash || DUMMY_HASH);
  return user && ok ? user : null;
}

export async function updateUserProfile(user: UserRecord, name: string, phone: string) {
  await updateRow("Users", user.row, {
    id: user.uid,
    name,
    email: user.email,
    phone,
    passwordHash: user.passwordHash,
    role: user.role === "admin" ? "admin" : "customer",
    createdAt: user.createdAt,
  });
}
