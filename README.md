# Teambull Fuel House

Online shop and billing system for Teambull Fuel House, a supplement store in Puducherry. Live at **[www.teambullfuelhouse.com](https://www.teambullfuelhouse.com)**.

Customers browse genuine products, add them to the cart, and checkout opens WhatsApp with the order already typed. Shop staff manage products, stock, orders and bills from the Admin area. A Google Sheet is the database.

**Built with:** Next.js 16 (App Router), React, TypeScript, Tailwind CSS, Google Sheets API, deployed on Vercel.

## Run it on your computer

Needs Node.js 20.9 or newer.

```bash
npm install
cp .env.example .env.local   # then fill in the values, see docs/setup-accounts-and-stock.md
npm run dev
```

Open http://localhost:3000. Without the Google Sheet values the site still runs, using the built-in product list.

| Command | What it does |
|---|---|
| `npm run dev` | Start the site locally |
| `npm run lint` | Check the code |
| `npx next typegen && npx tsc --noEmit` | Check types |
| `npm run build` | Production build (the same check CI runs) |

## Where to change things

| I want to change... | Where |
|---|---|
| Products, prices, stock | Admin (`/admin`) or the **Products** tab of the sheet |
| WhatsApp number, address, FSSAI, social links | `src/config/site.ts` |
| Bill details (GSTIN, tax, payment methods) | `src/config/billing.ts` |
| Christmas decorations on or off | `src/config/christmas.ts` |
| Feature switches (for example, login before checkout) | `src/config/features.ts` |
| WhatsApp order message wording | `src/lib/whatsapp.ts` |
| Built-in product list (used when the sheet is not set up) | `src/data/products.ts` |
| Product photos | `public/images/` |
| Colours and fonts | `src/app/globals.css` |
| Page content | `src/app/<page>/page.tsx` |

## Project structure

```
teambull-fuel-house/
├── .github/workflows/ci.yml   lint, type-check, build and audit on every pull request
├── .vscode/                   shared editor settings and recommended extensions
├── docs/                      requirements, architecture, sheet columns, deployment, setup
├── public/                    images and icons
└── src/
    ├── app/                   pages (one folder per web address) and server actions
    ├── components/            UI grouped by feature (admin, product, cart, play, christmas…)
    ├── config/                business settings and switches
    ├── context/               cart and user state
    ├── data/                  built-in products and nutrition labels
    ├── lib/                   sheet access, sessions, orders, bills, pricing, WhatsApp
    └── types/
```

## Docs

- [Requirements](docs/requirements.md)
- [Architecture](docs/architecture.md)
- [Google Sheet columns, staging and backups](docs/google-sheet.md)
- [Deployment, branches and releases](docs/deployment.md)
- [First-time setup: sheet, accounts and stock](docs/setup-accounts-and-stock.md)
- [Changelog](CHANGELOG.md)

## Credits

Christmas hat artwork on the wordmark from Vecteezy.com.
