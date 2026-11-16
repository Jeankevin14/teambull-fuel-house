import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { SITE } from "@/config/site";

export const metadata: Metadata = pageMeta({
  title: "Contact",
  description:
    "Contact Teambull Fuel House in Puducherry. Message us on WhatsApp or Instagram, or visit the shop on East Coast Road.",
  path: "/contact",
});

/** +917548854038 -> +91 75488 54038 */
function prettyPhone(digits: string) {
  const d = digits.replace(/\D/g, "");
  const cc = d.slice(0, 2);
  const rest = d.slice(2);
  return `+${cc} ${rest.slice(0, 5)} ${rest.slice(5)}`;
}

const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${SITE.name}, ${SITE.address}`
)}`;

const instaHandle = SITE.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, "@").replace(/\/$/, "");

function ChatIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.55L3 20.5l1.5-4.3A8.5 8.5 0 1 1 21 11.5Z" />
    </svg>
  );
}

function CameraIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function MailIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  );
}

function PinIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21.5s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
      <circle cx="12" cy="10.5" r="2.5" />
    </svg>
  );
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
      <h1 className="font-display text-4xl font-bold uppercase sm:text-5xl">
        Contact <span className="text-accent">Us</span>
      </h1>
      <p className="mt-3 max-w-xl text-muted">
        Order on WhatsApp, or come to the shop on East Coast Road. We answer stock
        and flavour questions too.
      </p>

      {/* WhatsApp — the way most orders happen, so it gets the room */}
      <section className="mt-10 overflow-hidden rounded-2xl border border-line bg-accent-soft">
        <div className="grid gap-8 p-6 sm:grid-cols-[1.1fr_1fr] sm:p-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-white">
                <ChatIcon className="h-6 w-6" />
              </span>
              <h2 className="font-display text-2xl font-bold uppercase">
                Message us on WhatsApp
              </h2>
            </div>
            <p className="mt-4 text-muted">
              Fastest way to reach us. Send your order, ask what is in stock, or
              check a flavour before you buy. Your cart arrives as a ready-made
              message, so you only tap send.
            </p>
            <a
              href={`https://wa.me/${SITE.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-accent px-7 py-3.5 font-display text-lg font-bold uppercase tracking-wide text-white"
            >
              Open WhatsApp
            </a>
            <p className="mt-4 text-sm text-muted">
              Or save our number:{" "}
              <a className="font-medium text-accent" href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener noreferrer">
                {prettyPhone(SITE.whatsapp)}
              </a>
            </p>
          </div>

          {/* What the message looks like before you send it */}
          <div className="self-center">
            <div className="rounded-2xl rounded-bl-md border border-line bg-white p-4 shadow-sm">
              <p className="text-sm leading-relaxed">
                Hello {SITE.name}! I&rsquo;d like to order:
                <br />
                <span className="text-muted">
                  1. Gibbon Muscle Whey &ndash; Latte x 1
                  <br />
                  Total: &#8377;2,150
                </span>
              </p>
            </div>
            <p className="mt-2 pl-1 text-xs text-muted">
              Your cart, typed out for you.
            </p>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <a
          href={SITE.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded-xl border border-line bg-surface p-6 transition-colors hover:border-accent"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-accent">
            <CameraIcon className="h-5 w-5" />
          </span>
          <h2 className="mt-4 font-display text-xl font-bold uppercase">Instagram</h2>
          <p className="mt-1 text-muted">New stock, offers and gym posts.</p>
          <p className="mt-3 font-medium text-accent">{instaHandle}</p>
        </a>

        <a
          href={`mailto:${SITE.email}`}
          className="group rounded-xl border border-line bg-surface p-6 transition-colors hover:border-accent"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-accent">
            <MailIcon className="h-5 w-5" />
          </span>
          <h2 className="mt-4 font-display text-xl font-bold uppercase">Email</h2>
          <p className="mt-1 text-muted">Bulk orders and anything you need in writing.</p>
          <p className="mt-3 break-all font-medium text-accent">{SITE.email}</p>
        </a>
      </div>

      <section className="mt-6 rounded-xl border border-line p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="mt-0.5 flex h-10 w-10 flex-none items-center justify-center rounded-full bg-accent text-white">
              <PinIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-xl font-bold uppercase">Visit the shop</h2>
              <address className="mt-2 not-italic leading-relaxed text-muted">
                No: 4-5, 1st Floor, East Coast Rd,
                <br />
                Kottupalayam, Puducherry 605008
              </address>
            </div>
          </div>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-none items-center justify-center rounded-lg border border-accent px-5 py-2.5 font-medium text-accent transition-colors hover:bg-accent hover:text-white"
          >
            Get directions
          </a>
        </div>
      </section>

      <p className="mt-10 text-muted">
        Not sure what to buy?{" "}
        <Link className="font-medium text-accent underline underline-offset-4" href="/find-supplement">
          Answer two questions
        </Link>{" "}
        and we will suggest what fits your goal.
      </p>
    </div>
  );
}
