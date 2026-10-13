"use client";

import { useState } from "react";
import Reveal from "@/components/fx/Reveal";
import { SITE } from "@/config/site";
import { buildChatUrl } from "@/lib/whatsapp";

const TABS = [
  { id: "story", label: "Our Story" },
  { id: "vision", label: "Our Vision" },
  { id: "why", label: "Why Team Bull" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const PILLARS = [
  { word: "People", text: "Help people transform their bodies and build lasting discipline." },
  { word: "Athletes", text: "Develop athletes from first-time lifters to competition stage." },
  { word: "Brand", text: "Grow TeamBull into a recognised fitness and transformation brand." },
  { word: "Business", text: "Create a scalable business with many ways to serve the fitness community." },
];

const SERVICES = [
  "Online Coaching",
  "Personal Training",
  "In-Person Training",
  "Home Training",
  "Diet Consultation",
  "3-Month Transformation Programs",
  "Competition Preparation",
  "Athlete Development",
  "Fitness Education",
  "Workshops & Seminars",
  "TeamBull-branded Fitness Products",
  "TeamBull Training Facilities",
];

const FUTURE = new Set(["TeamBull-branded Fitness Products", "TeamBull Training Facilities"]);

export default function AboutExplorer() {
  const [tab, setTab] = useState<TabId>("story");
  const [pillar, setPillar] = useState<number | null>(null);
  const [service, setService] = useState<string | null>(null);

  const founderLink = buildChatUrl("Hi Vishwam! I found Team Bull Fuel House online and would like to talk.");

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Heading */}
      <Reveal>
        <p className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-accent">
          About us
        </p>
        <h1 className="mt-1 font-display text-4xl font-bold uppercase leading-tight md:text-6xl">
          Built for <span className="text-accent">transformation.</span>
          <br />
          Designed for <span className="text-accent">growth.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-muted">
          TeamBull is a performance-driven bodybuilding and fitness coaching brand built around one
          powerful idea: help people transform their bodies, build discipline, and create a
          stronger lifestyle.
        </p>
      </Reveal>

      {/* Founder */}
      <Reveal delay={0.1} className="mt-8">
        <div className="flex flex-col items-center gap-5 rounded-2xl border border-line bg-surface p-6 sm:flex-row">
          <div
            className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-accent font-display text-4xl font-bold text-white shadow-lg"
            aria-hidden="true"
          >
            VD
          </div>
          <div className="text-center sm:text-left">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-accent">
              Founder
            </p>
            <h2 className="font-display text-3xl font-bold uppercase">Vishwam D</h2>
            <p className="mt-1 text-muted">
              The founder behind TeamBull, building people, athletes and a brand.
            </p>
          </div>
          <a
            href={founderLink}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-accent px-6 py-3 text-center text-sm font-bold text-white transition hover:bg-accent-dark sm:ml-auto"
          >
            Chat on WhatsApp
          </a>
        </div>
      </Reveal>

      {/* Tabs */}
      <div role="tablist" aria-label="About sections" className="mt-10 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`whitespace-nowrap rounded-full border px-5 py-2 font-display text-sm font-semibold uppercase tracking-wide transition ${
              tab === t.id
                ? "border-accent bg-accent text-white"
                : "border-line bg-white text-foreground hover:border-accent hover:text-accent"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 min-h-[22rem]">
        {tab === "story" && (
          <div role="tabpanel" id="panel-story" aria-labelledby="tab-story" className="space-y-4 text-muted">
            <p>
              We combine personalised coaching, structured training, nutrition guidance,
              transformation programs and competition preparation to deliver a complete fitness
              experience for beginners, athletes and serious bodybuilding enthusiasts.
            </p>
            <p className="font-display text-2xl font-bold uppercase text-foreground">
              But TeamBull is more than coaching.
            </p>
            <p>
              We are building a fitness brand with the potential to grow beyond a single location,
              a recognised fitness and transformation ecosystem that brings together coaching,
              personal training, online programs, athlete development, educational content,
              transformation programs and future fitness ventures.
            </p>
            <p>
              {SITE.name} is where that fuel comes from: genuine supplements, ordered simply on
              WhatsApp.
            </p>
          </div>
        )}

        {tab === "vision" && (
          <div role="tabpanel" id="panel-vision" aria-labelledby="tab-vision" className="space-y-5">
            <p className="font-display text-3xl font-bold uppercase text-foreground md:text-4xl">
              From one team. <span className="text-accent">To a movement.</span>
            </p>
            <p className="text-muted">
              Our long-term vision is to establish TeamBull as a scalable fitness brand that reaches
              clients both offline and online, expands into new locations, develops professional
              coaches and creates multiple revenue streams within the fitness industry.
            </p>
            <p className="font-semibold text-foreground">Our goal is simple. Tap each one:</p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {PILLARS.map((p, i) => (
                <button
                  key={p.word}
                  onClick={() => setPillar(pillar === i ? null : i)}
                  aria-expanded={pillar === i}
                  className={`rounded-xl border p-4 text-left transition ${
                    pillar === i
                      ? "border-accent bg-accent-soft shadow-md"
                      : "border-line bg-white hover:-translate-y-0.5 hover:border-accent"
                  }`}
                >
                  <span className="block text-xs font-semibold uppercase tracking-widest text-muted">
                    Build
                  </span>
                  <span className="font-display text-2xl font-bold uppercase text-accent">
                    {p.word}
                  </span>
                  {pillar === i && <span className="mt-2 block text-sm text-muted">{p.text}</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === "why" && (
          <div role="tabpanel" id="panel-why" aria-labelledby="tab-why" className="space-y-6">
            <div className="rounded-xl border border-line bg-surface p-5">
              <h3 className="font-display text-xl font-bold uppercase">A growing fitness market</h3>
              <p className="mt-2 text-muted">
                Fitness is evolving from traditional gym memberships toward personalised coaching,
                online fitness, transformation programs and performance-based training. TeamBull is
                built for exactly that shift.
              </p>
            </div>

            <div>
              <h3 className="font-display text-xl font-bold uppercase">
                Multiple ways to grow with TeamBull
              </h3>
              <p className="mt-1 text-sm text-muted">
                Our model can expand across all of these. Tap one to enquire.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {SERVICES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setService(service === s ? null : s)}
                    aria-pressed={service === s}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      service === s
                        ? "border-accent bg-accent text-white"
                        : "border-line bg-white hover:border-accent hover:text-accent"
                    }`}
                  >
                    {s}
                    {FUTURE.has(s) && <span className="ml-1 text-xs opacity-70">· coming</span>}
                  </button>
                ))}
              </div>

              {service && (
                <div className="mt-4 flex flex-col items-start gap-3 rounded-xl border border-accent bg-accent-soft p-4 sm:flex-row sm:items-center">
                  <p className="text-sm text-foreground">
                    Interested in <strong>{service}</strong>? Message us and we will get back to you.
                  </p>
                  <a
                    href={buildChatUrl(`Hi Team Bull! I'm interested in: ${service}. Can you share the details?`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-accent px-5 py-2 text-sm font-bold text-white transition hover:bg-accent-dark sm:ml-auto"
                  >
                    Ask on WhatsApp
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
