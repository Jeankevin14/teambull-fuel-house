import { Suspense } from "react";
import Link from "next/link";
import { CATEGORIES } from "@/config/site";
import { getProducts } from "@/lib/catalog";
import ProductCard from "@/components/product/ProductCard";
import HeroMotion from "@/components/fx/HeroMotion";
import MagneticLink from "@/components/fx/MagneticLink";
import Spotlight from "@/components/fx/Spotlight";
import AuthenticScan from "@/components/fx/AuthenticScan";
import Marquee from "@/components/fx/Marquee";
import Reveal from "@/components/fx/Reveal";
import CountUp from "@/components/fx/CountUp";
import Tilt from "@/components/fx/Tilt";

const TRUST = [
  ["Genuine Products", "Sourced from authorised suppliers"],
  ["Order on WhatsApp", "Quick, personal, no checkout hassle"],
  ["Fast Delivery", "We confirm your address and ship fast"],
];

async function FeaturedProducts() {
  const featured = (await getProducts()).slice(0, 3);
  return (
    <>
      {featured.map((p, i) => (
        <Reveal key={p.id} delay={i * 0.12} className="h-full">
          <ProductCard product={p} />
        </Reveal>
      ))}
    </>
  );
}

function FeaturedSkeleton() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-72 animate-pulse rounded-xl border border-line bg-surface"
        />
      ))}
    </>
  );
}

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-red-50">
        <svg
          className="ecg pointer-events-none absolute inset-x-0 bottom-3 h-20 w-full text-accent opacity-60"
          viewBox="0 0 900 100"
          preserveAspectRatio="none"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M0 55 H250 L275 55 L295 18 L325 92 L350 40 L368 55 H520 L545 55 L565 22 L595 88 L620 44 L638 55 H900" />
        </svg>

        <div className="relative mx-auto grid max-w-6xl items-center gap-4 px-4 pb-28 pt-6 md:grid-cols-2 md:gap-8 md:pb-32 md:pt-20">
          <div className="text-center md:text-left">
            <div className="logo-shine mx-auto mb-4 md:mx-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/teambull-logo.png"
                alt="Team Bull"
                className="hero-logo h-36 w-auto md:h-52"
              />
              <span className="logo-sheen" aria-hidden="true" />
              <i className="logo-spark" style={{ left: "30%", top: "14%" }} aria-hidden="true" />
              <i className="logo-spark" style={{ left: "72%", top: "30%", animationDelay: "0.9s" }} aria-hidden="true" />
              <i className="logo-spark" style={{ left: "50%", top: "58%", animationDelay: "1.7s" }} aria-hidden="true" />
            </div>
            <p
              className="hero-fade-up mb-4 text-sm font-semibold uppercase tracking-widest text-accent"
              style={{ "--d": "0.05s" } as React.CSSProperties}
            >
              100% Genuine Supplements
            </p>
            <h1 className="hero-shake font-display text-5xl font-bold uppercase leading-tight md:text-7xl">
              <span
                className="slam-word"
                style={{ "--d": "0.1s" } as React.CSSProperties}
              >
                Fuel
              </span>{" "}
              <span
                className="slam-word"
                style={{ "--d": "0.25s" } as React.CSSProperties}
              >
                Your
              </span>{" "}
              <span
                className="slam-word text-accent"
                style={{ "--d": "0.4s" } as React.CSSProperties}
              >
                Gains
              </span>
            </h1>
            <p
              className="hero-fade-up mx-auto mt-6 max-w-xl text-lg text-muted md:mx-0"
              style={{ "--d": "0.9s" } as React.CSSProperties}
            >
              Protein, creatine, pre-workout and more. Pick your products and
              order directly on WhatsApp.
            </p>
            <div
              className="hero-fade-up mt-8 flex flex-wrap items-center justify-center gap-3 md:justify-start"
              style={{ "--d": "1.05s" } as React.CSSProperties}
            >
              <MagneticLink
                href="/products"
                className="btn-shine rounded-full bg-accent px-8 py-4 font-semibold text-white hover:opacity-90"
              >
                Shop Now
              </MagneticLink>
              <Link
                href="/find-supplement"
                className="inline-block rounded-full border border-line bg-white px-8 py-4 font-semibold text-foreground transition hover:border-accent hover:text-accent"
              >
                Find my supplement
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="hero-glow" aria-hidden="true" />
            <HeroMotion />
          </div>
        </div>
      </section>

      <Marquee />

      {/* Numbers */}
      <section className="mx-auto max-w-6xl px-4 pt-14">
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { to: 100, suffix: "%", label: "Genuine products" },
            { to: CATEGORIES.length, suffix: "", label: "Categories" },
            { to: 2, suffix: "", label: "Free fitness tools" },
          ].map((n, i) => (
            <Reveal key={n.label} delay={i * 0.1}>
              <p className="font-display text-4xl font-bold text-accent md:text-6xl">
                <CountUp to={n.to} suffix={n.suffix} />
              </p>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted md:text-sm">
                {n.label}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-3xl font-bold uppercase">
          Shop by Category
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c} delay={i * 0.06} className="h-full">
              <Tilt max={10}>
                <Link
                  href={`/products?category=${encodeURIComponent(c)}`}
                  className="block rounded-xl border border-line bg-surface p-6 text-center font-semibold transition hover:border-accent hover:text-accent"
                >
                  {c}
                </Link>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Helpful tools */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <Reveal className="grid gap-4 md:grid-cols-3">
          <Spotlight className="rounded-xl">
          <Link
            href="/find-supplement"
            className="block h-full rounded-xl border border-line bg-surface p-6 transition hover:border-accent"
          >
            <p className="font-display text-xl font-bold uppercase text-accent">
              Find your supplement
            </p>
            <p className="mt-2 text-sm text-muted">
              Not sure what to buy? Answer 2 questions and get picks for your
              goal and budget.
            </p>
          </Link>
          </Spotlight>
          <Spotlight className="rounded-xl">
          <Link
            href="/protein-calculator"
            className="block h-full rounded-xl border border-line bg-surface p-6 transition hover:border-accent"
          >
            <p className="font-display text-xl font-bold uppercase text-accent">
              Protein calculator
            </p>
            <p className="mt-2 text-sm text-muted">
              See how much protein you need every day for your weight and goal.
            </p>
          </Link>
          </Spotlight>
          <Spotlight className="rounded-xl">
          <Link
            href="/bmi-calculator"
            className="block h-full rounded-xl border border-line bg-surface p-6 transition hover:border-accent"
          >
            <p className="font-display text-xl font-bold uppercase text-accent">
              BMI calculator
            </p>
            <p className="mt-2 text-sm text-muted">
              Check your BMI, daily calories and protein, and get a free
              consultation from Team Bull.
            </p>
          </Link>
          </Spotlight>
        </Reveal>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <Reveal className="flex items-end justify-between">
          <h2 className="font-display text-3xl font-bold uppercase">
            Featured <span className="text-accent">Products</span>
          </h2>
          <Link
            href="/products"
            className="text-sm text-muted hover:text-accent"
          >
            View all →
          </Link>
        </Reveal>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Suspense fallback={<FeaturedSkeleton />}>
            <FeaturedProducts />
          </Suspense>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-y border-line bg-red-50">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 text-center md:grid-cols-3">
          {TRUST.map(([title, text], i) => (
            <Reveal key={title} delay={i * 0.12}>
              {i === 0 && <AuthenticScan />}
              <h3 className="font-display text-xl uppercase text-accent">
                {title}
              </h3>
              <p className="mt-2 text-sm text-muted">{text}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
