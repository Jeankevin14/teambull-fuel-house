import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import PageShell from "@/components/ui/PageShell";
import { SITE } from "@/config/site";

export const metadata: Metadata = pageMeta({
  title: "Contact",
  description:
    "Contact Teambull Fuel House in Puducherry. Message us on WhatsApp or Instagram, or visit the shop.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <PageShell first="Contact" second="Us">
      <ul className="space-y-3">
        <li>
          WhatsApp:{" "}
          <a
            className="text-accent"
            href={`https://wa.me/${SITE.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            +{SITE.whatsapp}
          </a>
        </li>
        <li>
          Email:{" "}
          <a className="text-accent" href={`mailto:${SITE.email}`}>
            {SITE.email}
          </a>
        </li>
        <li>
          Instagram:{" "}
          <a
            className="text-accent"
            href={SITE.instagram}
            target="_blank"
            rel="noopener noreferrer"
          >
            {SITE.instagram}
          </a>
        </li>
        <li>Address: {SITE.address}</li>
      </ul>
    </PageShell>
  );
}
