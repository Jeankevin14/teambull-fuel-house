"use client";

import { useMemo, useSyncExternalStore } from "react";

export type GameId = "memory" | "rep" | "quiz";
export type Medal = "silver" | "gold";
export type BadgeId = GameId | "legend";
export type Earned = Partial<Record<GameId, Medal>>;

export const BADGE_INFO: Record<BadgeId, { name: string; how: string }> = {
  memory: { name: "Plate Master", how: "Win Silver in Plate Memory" },
  rep: { name: "Perfect Rep", how: "Win Silver in Perfect Rep" },
  quiz: { name: "Quiz Champion", how: "Win Silver in Gym Quiz" },
  legend: { name: "Team Bull Legend", how: "Earn all three badges" },
};

const KEY = "tfh-badges";
const EVENT = "tfh-badges";

function read() {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

/** badges earned in this browser (kept only on this device) */
export function useBadges(): Earned {
  const raw = useSyncExternalStore(
    (cb) => {
      window.addEventListener(EVENT, cb);
      window.addEventListener("storage", cb);
      return () => {
        window.removeEventListener(EVENT, cb);
        window.removeEventListener("storage", cb);
      };
    },
    read,
    () => "",
  );
  return useMemo(() => {
    try {
      return raw ? (JSON.parse(raw) as Earned) : {};
    } catch {
      return {};
    }
  }, [raw]);
}

export type Award = { game: GameId; medal: Medal; kind: "new" | "upgrade"; legend: boolean } | null;

/** gives the badge for a medal. Returns what changed, or null if nothing new. */
export function awardBadge(game: GameId, medal: Medal | "bronze"): Award {
  if (medal === "bronze") return null;
  try {
    const cur: Earned = JSON.parse(read() || "{}");
    const had = cur[game];
    if (had === "gold" || had === medal) return null;
    const hadLegend = legendOf(cur) !== null;
    const next: Earned = { ...cur, [game]: medal };
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
    return { game, medal, kind: had ? "upgrade" : "new", legend: !hadLegend && legendOf(next) !== null };
  } catch {
    return null;
  }
}

/** the Legend badge needs all three games; it is gold only if all three are gold */
export function legendOf(e: Earned): Medal | null {
  if (!e.memory || !e.rep || !e.quiz) return null;
  return e.memory === "gold" && e.rep === "gold" && e.quiz === "gold" ? "gold" : "silver";
}
