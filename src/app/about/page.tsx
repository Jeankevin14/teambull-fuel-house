import type { Metadata } from "next";
import PageShell from "@/components/ui/PageShell";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Team Bull is a performance-driven bodybuilding and fitness coaching brand. Genuine gym supplements from Teambull Fuel House in Puducherry.",
  alternates: { canonical: "/about" },
};

const OFFERINGS = [
  "Online & in-person coaching",
  "Personal training",
  "Diet consultation",
  "3-month transformation programs",
  "Competition preparation",
  "Athlete development",
  "Workshops & seminars",
  "Genuine supplements",
];

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="pt-4 font-display text-2xl font-bold uppercase text-foreground">
      {children}
    </h2>
  );
}

export default function AboutPage() {
  return (
    <PageShell first="About" second="Team Bull">
      <p className="font-display text-xl font-semibold uppercase tracking-wide text-accent">
        Built for transformation. Designed for growth.
      </p>
      <p>
        Team Bull is a performance-driven bodybuilding and fitness coaching
        brand built on one idea: help people transform their bodies, build
        discipline and create a stronger lifestyle.
      </p>
      <p>
        We combine personalised coaching, structured training, nutrition
        guidance and competition preparation for beginners, athletes and
        serious bodybuilding enthusiasts. {SITE.name} is our supplement store,
        so you can fuel your training with genuine products from a team that
        trains too.
      </p>

      <Heading>What we do</Heading>
      <ul className="grid gap-2 sm:grid-cols-2">
        {OFFERINGS.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="font-bold text-accent">▸</span>
            {item}
          </li>
        ))}
      </ul>

      <Heading>Our vision</Heading>
      <p className="font-display text-lg font-semibold uppercase text-foreground">
        From one team. To a movement.
      </p>
      <p>
        We are growing TeamBull into a recognised fitness and transformation
        brand, reaching people offline and online, developing professional
        coaches and building TeamBull-branded products and training facilities.
      </p>
      <p className="font-semibold text-foreground">
        Build people. Build athletes. Build a brand.
      </p>
    </PageShell>
  );
}
