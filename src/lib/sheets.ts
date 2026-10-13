// Talks to Google Sheets. Server-side only (never import this in a "use client" file).
// Your Google Sheet is the database: Products, Users and Orders tabs.
import { importPKCS8, SignJWT } from "jose";

const SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const TOKEN_URL = process.env.GOOGLE_TOKEN_URL || "https://oauth2.googleapis.com/token";
const API = process.env.SHEETS_API_BASE || "https://sheets.googleapis.com/v4/spreadsheets";

/** The tabs and their column headers (row 1 of each tab). */
export const TABS = {
  Products: [
    "id", "name", "brand", "category", "price", "description",
    "image", "flavours", "sizes", "stock", "active",
  ],
  Users: ["id", "name", "email", "phone", "passwordHash", "role", "createdAt"],
  Orders: ["orderId", "date", "userId", "name", "email", "phone", "items", "total", "status"],
} as const;

export type TabName = keyof typeof TABS;
export type Row = Record<string, string> & { _row: number };

function clean(v: string | undefined) {
  return (v ?? "").trim().replace(/^["']|["']$/g, "");
}

function config() {
  const sheetId = clean(process.env.GOOGLE_SHEET_ID);
  const clientEmail = clean(process.env.GOOGLE_CLIENT_EMAIL);
  const privateKey = clean(process.env.GOOGLE_PRIVATE_KEY).replace(/\\n/g, "\n");
  if (!sheetId || !clientEmail || !privateKey) return null;
  return { sheetId, clientEmail, privateKey };
}

export function sheetsConfigured() {
  return config() !== null;
}

let tokenCache: { token: string; exp: number } | null = null;

async function getToken(): Promise<string> {
  const cfg = config();
  if (!cfg) throw new Error("Google Sheet is not set up yet.");
  if (tokenCache && tokenCache.exp > Date.now() + 60_000) return tokenCache.token;

  const key = await importPKCS8(cfg.privateKey, "RS256");
  const assertion = await new SignJWT({ scope: SCOPE })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(cfg.clientEmail)
    .setAudience(TOKEN_URL)
    .setIssuedAt()
    .setExpirationTime("55m")
    .sign(key);

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Google sign-in failed (${res.status}). Check the service account keys.`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  tokenCache = { token: data.access_token, exp: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

async function api(path: string, init: RequestInit = {}, attempt = 1): Promise<unknown> {
  const cfg = config();
  if (!cfg) throw new Error("Google Sheet is not set up yet.");
  const token = await getToken();
  const res = await fetch(`${API}/${cfg.sheetId}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
  if ((res.status === 429 || res.status >= 500) && attempt < 3) {
    await new Promise((r) => setTimeout(r, 400 * attempt));
    return api(path, init, attempt + 1);
  }
  if (!res.ok) {
    let detail = "";
    try {
      detail = ((await res.json()) as { error?: { message?: string } }).error?.message ?? "";
    } catch {}
    throw new Error(`Google Sheets error ${res.status}: ${detail}`);
  }
  return res.json();
}

// ---- make sure the 3 tabs and their header rows exist (runs once per server) ----
let ready: Promise<void> | null = null;
const headerCache: Partial<Record<TabName, string[]>> = {};

async function setup() {
  const meta = (await api("?fields=sheets.properties.title")) as {
    sheets?: { properties: { title: string } }[];
  };
  const have = new Set((meta.sheets ?? []).map((s) => s.properties.title));
  const missing = (Object.keys(TABS) as TabName[]).filter((t) => !have.has(t));
  if (missing.length) {
    await api(":batchUpdate", {
      method: "POST",
      body: JSON.stringify({
        requests: missing.map((title) => ({ addSheet: { properties: { title } } })),
      }),
    });
  }
  for (const tab of Object.keys(TABS) as TabName[]) {
    const r = (await api(`/values/${tab}!1:1`)) as { values?: string[][] };
    const row = r.values?.[0]?.map((h) => String(h).trim()) ?? [];
    if (row.length === 0) {
      await api(`/values/${tab}!A1?valueInputOption=RAW`, {
        method: "PUT",
        body: JSON.stringify({ values: [[...TABS[tab]]] }),
      });
      headerCache[tab] = [...TABS[tab]];
    } else {
      headerCache[tab] = row;
    }
  }
}

export function ensureSheets(): Promise<void> {
  if (!ready) {
    ready = setup().catch((e) => {
      ready = null; // try again next time
      throw e;
    });
  }
  return ready;
}

function headersOf(tab: TabName): string[] {
  return headerCache[tab] ?? [...TABS[tab]];
}

/** Reads every row of a tab. Each row is an object keyed by the column header. */
export async function readTab(tab: TabName): Promise<Row[]> {
  await ensureSheets();
  const r = (await api(`/values/${tab}!A:Z`)) as { values?: string[][] };
  const values = r.values ?? [];
  if (values.length < 2) return [];
  const headers = values[0].map((h) => String(h).trim());
  headerCache[tab] = headers;
  const rows: Row[] = [];
  for (let i = 1; i < values.length; i++) {
    const cells = values[i];
    if (!cells || cells.every((c) => String(c ?? "").trim() === "")) continue;
    const row: Record<string, string> = {};
    headers.forEach((h, c) => {
      row[h] = String(cells[c] ?? "");
    });
    rows.push({ ...row, _row: i + 1 } as Row);
  }
  return rows;
}

function toCells(tab: TabName, data: Record<string, string | number | boolean>) {
  return headersOf(tab).map((h) => {
    const v = data[h];
    return v === undefined || v === null ? "" : String(v);
  });
}

export async function appendRow(tab: TabName, data: Record<string, string | number | boolean>) {
  await ensureSheets();
  await api(`/values/${tab}!A1:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
    method: "POST",
    body: JSON.stringify({ values: [toCells(tab, data)] }),
  });
}

export async function appendRows(tab: TabName, list: Record<string, string | number | boolean>[]) {
  if (list.length === 0) return;
  await ensureSheets();
  await api(`/values/${tab}!A1:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
    method: "POST",
    body: JSON.stringify({ values: list.map((d) => toCells(tab, d)) }),
  });
}

/** Replaces the whole row with `data` (row = sheet row number). */
export async function updateRow(
  tab: TabName,
  row: number,
  data: Record<string, string | number | boolean>
) {
  await ensureSheets();
  await api(`/values/${tab}!A${row}?valueInputOption=RAW`, {
    method: "PUT",
    body: JSON.stringify({ values: [toCells(tab, data)] }),
  });
}
