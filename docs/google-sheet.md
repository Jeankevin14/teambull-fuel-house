# Google Sheet (the database)

The site keeps its data in one Google Sheet with four tabs. The site creates any missing tab and header row by itself (`src/lib/sheets.ts`), and adds new columns when a newer version of the site needs them. Row 1 of each tab is the header row: do not rename those headers.

## Products

| Column | Meaning |
|---|---|
| `id` | Unique number for the product |
| `name`, `brand`, `category` | Shown on the shop |
| `price` | Selling price in rupees |
| `mrp` | Printed price, used to show the saving |
| `description` | Product text |
| `image` | Path of the photo in `public/` |
| `flavours` | Flavour names |
| `sizes` | Size options with prices, like `1kg:1999\|2kg:3499` |
| `stock` | Units in stock. `0` shows "Out of stock" |
| `active` | `FALSE` hides the product |

## Users

| Column | Meaning |
|---|---|
| `id`, `name`, `email`, `phone` | The customer |
| `passwordHash` | Scrambled password. It cannot be read back |
| `role` | `customer`, or `admin` for shop staff (set by hand in the sheet) |
| `createdAt` | When the account was made |

## Orders

Saved when a logged-in customer taps "Checkout on WhatsApp".

| Column | Meaning |
|---|---|
| `orderId`, `date` | Order number and time |
| `userId`, `name`, `email`, `phone` | Who ordered |
| `items` | Products, quantities and prices (prices checked on the server) |
| `total` | Order total |
| `status` | Starts as `New`; changed from Admin |

## Bills

Made at the billing counter in Admin.

| Column | Meaning |
|---|---|
| `billNo`, `date` | Bill number and time |
| `customerName`, `customerPhone` | Customer on the bill |
| `items` | Readable list of the lines |
| `itemsJson` | Exact lines, used to reprint the bill. Do not edit by hand |
| `subtotal`, `discount`, `discountPercent`, `tax`, `delivery`, `total` | Amounts |
| `payment` | Payment method, for example Cash |
| `createdBy` | Staff member who made the bill |
| `status` | `ok`, or `cancelled` |
| `cancelledAt`, `cancelledBy`, `cancelReason` | Filled in when a bill is cancelled |
| `stockTaken` | Stock taken by the bill, used to put it back on cancel. Do not edit by hand |

## Environments and backups (project standard)

The standard asks for a separate database per environment and regular backups. With Google Sheets this means:

- [ ] **Production sheet:** the one in Vercel's Production environment variables. Only the live site writes to it.
- [ ] **Staging sheet:** a copy (File → Make a copy), shared with the same service account, set in Vercel's **Preview** environment variables. Preview deployments and local development use this one, never production.
- [ ] **Backups:** make a dated copy of the production sheet at least once a week (File → Make a copy → name it `Teambull backup YYYY-MM-DD`), and always before changing columns by hand. Keep at least the last 7.
- [ ] **Restore test:** once a month, open a backup copy and check it opens and has today's products and bills.

Google Sheets suits the shop at its current size. If orders grow to many a day, move to Postgres (for example Supabase or Neon).
