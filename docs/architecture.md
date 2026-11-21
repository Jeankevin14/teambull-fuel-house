# Architecture

Teambull Fuel House is a single Next.js app (App Router, TypeScript, Tailwind CSS) deployed on Vercel. A Google Sheet is its database. There is no separate backend server: data is read and written by server-side code in the same app.

```
Browser ──► Next.js on Vercel ──► Google Sheets API ──► Google Sheet (Products, Users, Orders, Bills)
   │              │
   │              └─ server actions (src/app/actions) and server components read/write the sheet
   └─ cart kept in the browser (localStorage); checkout opens WhatsApp with the order typed in
```

## Main parts

| Area | Where | What it does |
|---|---|---|
| Pages | `src/app/*` | One folder per web address: shop, product pages, cart, about, contact, policies, calculators, Play & Win, launch film, account, admin |
| Server actions | `src/app/actions/` | `auth.ts` (sign up, log in, profile, order log), `admin.ts` (products, stock, order status), `billing.ts` (create and cancel bills) |
| Sheet access | `src/lib/sheets.ts` | Talks to the Google Sheets API with a service account (signed JWT). Server-only: it refuses to run in the browser |
| Catalogue | `src/lib/catalog.ts`, `src/lib/products.ts`, `src/data/products.ts` | Products come from the sheet; the built-in list in `src/data/products.ts` is the fallback when the sheet is not set up |
| Accounts | `src/lib/users.ts`, `src/lib/session.ts`, `src/lib/token.ts` | Hashed passwords in the Users tab; signed, http-only session cookie |
| Orders | `src/lib/orders.ts`, `logOrderAction` | When a logged-in customer taps "Checkout on WhatsApp", the order is saved with prices looked up on the server |
| Billing counter | `src/lib/bills.ts`, `src/components/admin/` | Admin makes a bill, stock goes down; cancelling a bill puts the stock back; PDF download with jsPDF |
| Cart | `src/context/CartContext.tsx` | Cart stored in the browser |
| WhatsApp message | `src/lib/whatsapp.ts` | Builds the order message |
| Settings | `src/config/` | `site.ts` (business details, WhatsApp number, FSSAI), `billing.ts`, `features.ts`, `christmas.ts` (decoration switch), `people.ts`, `rewards.ts` |
| Security | `next.config.ts`, `src/lib/validate.ts` | Security headers and Content-Security-Policy; input validation and rate limiting |

## Environment variables

Names only (values live in `.env.local` and in Vercel settings, never in Git). See `.env.example`.

| Name | Used for |
|---|---|
| `GOOGLE_SHEET_ID` | Which spreadsheet is the database |
| `GOOGLE_CLIENT_EMAIL` | Service account that can edit the sheet |
| `GOOGLE_PRIVATE_KEY` | That service account's key |
| `SESSION_SECRET` | Signs login sessions (32+ characters) |

The sheet's tabs and columns are described in [google-sheet.md](google-sheet.md).
