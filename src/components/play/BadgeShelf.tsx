"use client";

import { BADGE_INFO, legendOf, useBadges, type BadgeId } from "@/lib/badges";
import BadgeIcon from "./BadgeIcon";

const ORDER: BadgeId[] = ["memory", "rep", "quiz", "legend"];

export default function BadgeShelf() {
  const earned = useBadges();
  const legend = legendOf(earned);
  const count = ORDER.filter((id) => (id === "legend" ? legend : earned[id])).length;

  return (
    <div className="rounded-3xl border border-line bg-surface p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold uppercase">Your badges</h2>
        <span className="text-sm font-semibold text-muted">{count}/4 earned</span>
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ORDER.map((id) => {
          const tier = id === "legend" ? legend : (earned[id] ?? null);
          return (
            <li key={id} className="flex flex-col items-center rounded-2xl bg-white px-2 py-4 text-center">
              <BadgeIcon id={id} tier={tier} className={`h-20 w-20 ${tier ? "anim-pop" : ""}`} />
              <p className={`mt-2 font-display text-base font-bold uppercase leading-tight ${tier ? "" : "text-muted"}`}>{BADGE_INFO[id].name}</p>
              <p className="mt-0.5 text-xs text-muted">{tier ? `${tier === "gold" ? "Gold" : "Silver"} badge` : BADGE_INFO[id].how}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
