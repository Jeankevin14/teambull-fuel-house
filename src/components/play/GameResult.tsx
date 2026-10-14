"use client";

import Link from "next/link";
import { useState } from "react";
import { REWARDS_ENABLED, TIERS, type Tier } from "@/config/rewards";
import { BADGE_INFO, legendOf, useBadges, type Award } from "@/lib/badges";
import { makeCertificate } from "@/lib/certificate";
import { buildChatUrl } from "@/lib/whatsapp";
import BadgeIcon from "./BadgeIcon";

export default function GameResult({
  game,
  score,
  detail,
  tier,
  best,
  award,
  onAgain,
}: {
  game: string;
  score: string;
  detail: string;
  tier: Tier;
  best: string | null;
  award: Award;
  onAgain: () => void;
}) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [date] = useState(() => new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }));
  const earned = useBadges();
  const t = TIERS[tier];
  const hasReward = REWARDS_ENABLED && t.reward !== "";
  const hasCert = tier !== "bronze";
  const certName = name.trim() || "Gym Champion";
  const legend = legendOf(earned);

  async function download() {
    setBusy(true);
    try {
      const blob = await makeCertificate({ name: certName, game, score, medal: t.label as "Gold" | "Silver" | "Bronze", date });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `team-bull-certificate-${game.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } finally {
      setBusy(false);
    }
  }

  const claimMsg = [
    "Hi Team Bull Fuel House! I played on your website and would like to claim my reward.",
    "",
    ...(name.trim() ? [`Name: ${name.trim()}`] : []),
    `Game: ${game}`,
    `Score: ${score} (${t.label})`,
    `Reward: ${t.reward}`,
  ].join("\n");

  const shareMsg = `I just won the ${t.label} medal in ${game} at Team Bull Fuel House! Score: ${score}. Can you beat me? https://www.teambullfuelhouse.com/play`;

  return (
    <div className="bmi-step mx-auto max-w-xl space-y-5">
      <div className="rounded-3xl border border-line bg-white p-6 text-center shadow-sm sm:p-8">
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
        {!hasCert && <p className="mt-4 text-sm text-muted">Reach the Silver medal to earn a badge and a certificate.</p>}
      </div>

      {award && (
        <div className="anim-pop rounded-3xl border-2 border-amber-300 bg-amber-50 p-5 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-700">{award.kind === "upgrade" ? "Badge upgraded" : "New badge unlocked"}</p>
          <div className="mt-2 flex items-center justify-center gap-4">
            <BadgeIcon id={award.game} tier={award.medal} className="h-24 w-24" />
            {award.legend && legend && <BadgeIcon id="legend" tier={legend} className="h-24 w-24" />}
          </div>
          <p className="mt-1 font-display text-2xl font-bold uppercase">{BADGE_INFO[award.game].name}</p>
          {award.legend && <p className="font-display text-lg font-bold uppercase text-accent">And Team Bull Legend!</p>}
        </div>
      )}

      {hasCert && (
        <div className="rounded-3xl border border-line bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-center font-display text-xl font-bold uppercase">Your certificate</h3>

          {/* live preview */}
          <div className="relative mx-auto mt-4 aspect-[1600/1130] w-full overflow-hidden border-[5px] border-foreground bg-[#fffaf3] text-center">
            <div className="absolute inset-[2.5%] border border-[#b8860b]" />
            <div className="absolute inset-0 flex flex-col items-center justify-center px-[8%]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/teambull-logo.png" alt="" className="h-[14%] w-auto" />
              <p className="mt-[1%] text-[7px] font-semibold tracking-[0.25em] sm:text-[9px]">TEAMBULL FUEL HOUSE</p>
              <p className="font-display text-[15px] font-bold leading-tight text-accent sm:text-[24px]">CERTIFICATE OF ACHIEVEMENT</p>
              <p className="mt-[1.5%] font-serif text-[8px] italic text-muted sm:text-[11px]">This is proudly presented to</p>
              <p className="mt-[1%] max-w-full truncate border-b border-[#b8860b] px-6 font-display text-[22px] font-bold sm:text-[34px]">{certName}</p>
              <p className="mt-[1.5%] font-serif text-[8px] italic text-muted sm:text-[11px]">for winning the {t.label} medal in</p>
              <p className="font-display text-[14px] font-bold uppercase text-accent sm:text-[22px]">{game}</p>
              <p className="text-[8px] font-semibold sm:text-[11px]">Score: {score}</p>
              <p className="mt-[2%] text-[7px] text-muted sm:text-[9px]">{date} · teambullfuelhouse.com</p>
            </div>
          </div>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={28}
            placeholder="Type your name for the certificate"
            aria-label="Your name for the certificate"
            className="mx-auto mt-4 block w-full max-w-sm rounded-full border border-line bg-white px-5 py-2.5 text-center text-sm outline-none focus:border-accent"
          />
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={download}
              disabled={busy}
              className="btn-shine rounded-full bg-accent px-7 py-3 font-bold text-white transition hover:bg-accent-dark disabled:opacity-60"
            >
              {busy ? "Preparing…" : "Download certificate"}
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(shareMsg)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-line bg-white px-7 py-3 font-semibold transition hover:border-accent hover:text-accent"
            >
              Share on WhatsApp
            </a>
          </div>
        </div>
      )}

      {hasReward && (
        <div className="rounded-3xl border-2 border-dashed border-accent bg-accent-soft p-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">You won</p>
          <p className="mt-1 font-display text-2xl font-bold uppercase">{t.reward}</p>
          <a
            href={buildChatUrl(claimMsg)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block rounded-full bg-accent px-8 py-3 font-bold text-white transition hover:bg-accent-dark"
          >
            Claim on WhatsApp
          </a>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
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
