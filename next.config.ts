import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// Content Security Policy.
// 'unsafe-inline' is needed because Next.js adds small inline scripts/styles to
// every page; 'unsafe-eval' is only needed by the dev server. Everything else is
// locked to this site, so injected <script src="..."> from another domain is blocked.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: blob:",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
  "font-src 'self' data:",
  "connect-src 'self'",
  ...(isProd ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // stop the browser guessing a file's type (protects the product-image route)
  { key: "X-Content-Type-Options", value: "nosniff" },
  // no one can put this site inside an iframe
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // this site needs none of these, so turn them off
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // browsers must use HTTPS for this site for the next 2 years
  ...(isProd
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
    : []),
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // don't tell the world which framework runs the site
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // never let a browser or proxy cache a signed-in person's identity
      { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }] },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
