# Accounts & stock setup (Google Sheet)

Your Google Sheet is the database. It keeps **Products & stock**, **customer accounts** and **orders**.
Until you finish this, the website still works: it shows the products from `src/data/products.ts`.

## 1. Create the Google Sheet
1. Go to https://sheets.google.com and create a **blank spreadsheet**. Name it `Teambull Fuel House`.
2. Copy the long id from its address: `https://docs.google.com/spreadsheets/d/`**THIS_PART**`/edit` → this is `GOOGLE_SHEET_ID`.
3. Leave it empty. The website creates the tabs **Products**, **Users** and **Orders** by itself.

## 2. Create the "robot account" that can edit the sheet
1. Open https://console.cloud.google.com and sign in with the same Gmail.
2. Top bar → project list → **New project** → name `teambull-fuel-house` → Create.
3. Menu → **APIs & Services → Library** → search **Google Sheets API** → **Enable**.
4. Menu → **IAM & Admin → Service Accounts → Create service account** → name `website` → Create and continue → Done.
5. Click the new service account → **Keys** tab → **Add key → Create new key → JSON → Create**. A `.json` file downloads. Keep it private.
6. Open that file. You need two values:
   - `client_email`  → `GOOGLE_CLIENT_EMAIL`
   - `private_key`   → `GOOGLE_PRIVATE_KEY`
7. Back in your Google Sheet: **Share** → paste the `client_email` → role **Editor** → Send.

## 3. Put the values in `.env.local` (on your computer)
1. In the project folder, copy `.env.example` and name the copy `.env.local`.
2. Fill in the four values. Keep the `private_key` inside double quotes exactly as in the file (with the `\n` marks).
3. `SESSION_SECRET`: type any long random text, at least 32 characters.
4. Stop the site (Ctrl+C) and run `npm run dev` again.

`.env.local` is ignored by git, so it never goes to your public GitHub. Do not share it.

## 4. Make yourself the admin
1. Open the website → **Login → Create an account** (use your own email).
2. Open your Google Sheet → tab **Users** → find your row → in the **role** column type `admin`.
3. Refresh the website. You now see **Admin** in the top menu, or open `/admin`.
   Only someone who can edit your Google Sheet can make an admin, so customers cannot.

## 5. Add products and stock
- Open `/admin`. Click **Load sample products** once, or **Add a new product**.
- Use **−1 / +1 / +10** to change stock. Stock 0 shows "Out of stock" to customers.
- Changes show on the website straight away.
- You can also edit the **Products** tab in the sheet directly. The website picks up the change within about 1 minute.
- Sheet columns: `id, name, brand, category, price, description, image, flavours, sizes, stock, active`.
  `sizes` looks like `1kg:1999|2kg:3499`. `active` = `FALSE` hides a product.

## 6. When you deploy on Vercel
Vercel project → **Settings → Environment Variables** → add the same four names and values
(`GOOGLE_SHEET_ID`, `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `SESSION_SECRET`) → **Redeploy**.

## Notes
- Passwords are stored only as a scrambled (hashed) version. Nobody can read them, not even you.
- To force customers to log in before checkout, keep `REQUIRE_LOGIN_TO_CHECKOUT = true` in `src/config/features.ts`. Set it to `false` to let guests check out.
- Forgot-password emails are not included. If a customer forgets their password, delete their row in the **Users** tab and ask them to sign up again.
- Google Sheets is great for a small shop. If you grow to many orders a day, we can move to a real database later.
