import Link from "next/link";
import { SITE } from "@/config/site";

const LINKS = [
  { href: "/products", label: "Products" },
  { href: "/find-supplement", label: "Find Supplement" },
  { href: "/protein-calculator", label: "Protein Calculator" },
  { href: "/bundles", label: "Combo Packs" },
  { href: "/bmi-calculator", label: "BMI Calculator" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/refund-policy", label: "Refunds" },
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-muted">
        <p className="font-display text-lg uppercase text-foreground">
          {SITE.name}
        </p>
        <p className="mt-2">
          {SITE.tagline}. Genuine supplements, delivered to you.
        </p>

        <p className="mt-2">{SITE.address}</p>

        <p className="mt-2">
          Follow us on{" "}
          <a
            href={SITE.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            Instagram
          </a>
        </p>

        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-accent">
              {l.label}
            </Link>
          ))}
        </div>

        {SITE.fssai && <p className="mt-6">FSSAI Lic. No: {SITE.fssai}</p>}

        <p className="mt-6">
          © {SITE.year} {SITE.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
