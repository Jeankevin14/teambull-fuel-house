# Changelog

All notable changes to this project. Versions follow [semantic versioning](https://semver.org): `MAJOR.MINOR.PATCH`.

## [Unreleased]

### Added
- Project standard setup: CI on every pull request (lint, type-check, build, security audit), shared VS Code settings, and a `docs/` folder (requirements, architecture, Google Sheet columns, deployment).

### Changed
- README describes the live site and links to the docs. The setup guide moved to `docs/setup-accounts-and-stock.md`.

## [1.0.0] - 2026-11-21

First tagged release: the site as it runs live at www.teambullfuelhouse.com.

### Shop
- Catalogue of real products with photos, nutrition labels, flavours, sizes, MRP and savings
- Live stock from the Google Sheet; out-of-stock products marked
- Cart and checkout on WhatsApp; orders saved for logged-in customers with server-checked prices
- Customer accounts

### Admin
- Products, prices and stock, managed live
- Billing counter: make a bill with the shop logo, search to add products, discount in percent, delivery charge, print and PDF
- Cancel a bill and have totals and stock follow; cancelled bills listed separately; duplicate-bill guard

### Extras
- BMI calculator, protein calculator and supplement finder
- Play & Win games with badges and a downloadable certificate
- Launch film at `/launch`
- Christmas decorations behind one switch

### Quality and security
- Security headers and Content-Security-Policy, server-only guards, rate limiting
- SEO: titles, descriptions, canonical links, structured data, share images
- Next.js 16.4.6 (security advisory fixed) and jsPDF 4.2.1
