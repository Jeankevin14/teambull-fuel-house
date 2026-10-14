"use client";

import Link from "next/link";
import { useState } from "react";
import { REWARDS_ENABLED, TIERS, type Tier } from "@/config/rewards";
import { buildChatUrl } from "@/lib/whatsapp";

export default function GameResult({
  game,
  score,
  detail,
  tier,
  best,
  onAgain,
}: {
  game: string;
  score: string;
  detail: string;
  tier: Tier;
  best: string | null;
  onAgain: () => void;
}) {
  const [name, setName] = useState("");
  const t = TIERS[tier];
  const hasReward = REWARDS_ENABLED && t.reward !== "";

  const msg = [
    "Hi Team Bull Fuel House! I played on your website and would like to claim my reward.",
    "",
    ...(name.trim() ? [`Name: ${name.trim()}`] : []),
    `Game: ${game}`,
    `Score: ${score} (${t.label})`,
    `Reward: ${t.reward}`,
  ].join("\n");

  return (
    <div className="bmi-step mx-auto max-w-xl rounded-3xl border border-line bg-white p-6 text-center shadow-sm sm:p-8">
      <div className="flex justify-center gap-2" aria-label={`${t.stars} out of 3 stars`}>
        {[1, 2, 3].map((n) => (
          <svg
            key={n}
            viewBox="0 0 24 24"
            className={`h-12 w-12 ${n <= t.stars ? "anim-pop text-amber-400" : "text-line"}`}
            style={{ animationDelay: `${n * 160}ms` }}
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2l3 6.5 7 .9-5.2 4.8 1.4 7L12 17.8 5.8 21.2l1.4-7L2 9.4l7-.9z" />
          </svg>
        ))}
      </div>
      <p className="mt-3 font-display text-sm font-bold uppercase tracking-widest text-accent">{t.label} medal</p>
      <p className="mt-1 font-display text-6xl font-bold tabular-nums">{score}</p>
      <p className="mt-1 text-sm text-muted">{detail}</p>
      {best && <p className="mt-1 text-xs text-muted">Your best: {best}</p>}

      {hasReward ? (
        <div className="mt-6 rounded-2xl border-2 border-dashed border-accent bg-accent-soft p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">You won</p>
          <p className="mt-1 font-display text-2xl font-bold uppercase">{t.reward}</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            placeholder="Your name (optional)"
            aria-label="Your name (optional)"
            className="mx-auto mt-3 block w-full max-w-xs rounded-full border border-line bg-white px-5 py-2.5 text-sm outline-none focus:border-accent"
          />
          <a
            href={buildChatUrl(msg)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-shine mt-3 inline-block rounded-full bg-accent px-8 py-3 font-bold text-white transition hover:bg-accent-dark"
          >
            Claim on WhatsApp
          </a>
        </div>
      ) : (
        <p className="mt-6 text-sm text-muted">Reach the Silver or Gold medal to win a reward.</p>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onAgain}
          className="rounded-full border border-line bg-white px-7 py-3 font-semibold transition hover:border-accent hover:text-accent"
        >
          Play again
        </button>
        <Link href="/bundles" className="rounded-full bg-foreground px-7 py-3 font-semibold text-white transition hover:bg-accent">
          Shop combo packs
        </Link>
      </div>
    </div>
  );
}
