# Teambull Fuel House

Online store for gym supplements. Customers pick products, and checkout opens
WhatsApp with the order (products, quantities, prices, total) already typed.

## Run it on your computer

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Where to change things

| I want to change...              | Edit this file                     |
| -------------------------------- | ---------------------------------- |
| WhatsApp number, email, Instagram | `src/config/site.ts`               |
| Categories                       | `src/config/site.ts`               |
| Products and prices              | `src/data/products.ts`             |
| Product photos                   | put in `public/images/`            |
| WhatsApp order message wording   | `src/lib/whatsapp.ts`              |
| Colours (orange accent)          | `src/app/globals.css`              |
| About / Contact / policies       | `src/app/<page>/page.tsx`          |

## Folder structure

```
teambull-fuel-house/
├── public/
│   └── images/                 product photos
├── src/
│   ├── app/                    pages (each folder = one web address)
│   │   ├── layout.tsx          wraps every page (header, footer, cart)
│   │   ├── page.tsx            home page
│   │   ├── globals.css         colours and fonts
│   │   ├── icon.svg            browser tab icon
│   │   ├── not-found.tsx       404 page
│   │   ├── sitemap.ts          for Google
│   │   ├── robots.ts           for Google
│   │   ├── products/
│   │   │   ├── page.tsx        all products + filters
│   │   │   └── [id]/page.tsx   single product page
│   │   ├── cart/page.tsx       cart + Checkout on WhatsApp
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── privacy/page.tsx
│   │   ├── terms/page.tsx
│   │   └── refund-policy/page.tsx
│   ├── components/
│   │   ├── layout/             Header, Footer, CartLink, CartToast, WhatsAppButton
│   │   ├── product/            ProductCard, ProductGrid, ProductImage, AddToCartButton
│   │   └── ui/                 PageShell (shared page wrapper)
│   ├── config/site.ts          business details + categories
│   ├── context/CartContext.tsx cart memory (saved in the browser)
│   ├── data/products.ts        product list
│   ├── lib/                    whatsapp.ts (order message), format.ts (₹ prices)
│   └── types/index.ts          shared types
├── package.json
└── README.md
```

## Add a product

1. (Optional) add the photo to `public/images/`.
2. Open `src/data/products.ts` and copy one product block.
3. Give it a new unique `id`, and change name, price, description, image.
4. Save. The site updates by itself.

## Before going live

- Replace the sample WhatsApp number, Instagram, email and address in `src/config/site.ts`.
- Replace sample products with your real ones.
- Get your FSSAI license / GST sorted and add the FSSAI number in `src/config/site.ts`.
- Have the Privacy, Terms and Refund pages reviewed by a professional.
- Run `npm run build` once to check there are no errors.
