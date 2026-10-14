"use client";

import { useSyncExternalStore } from "react";

const EVENT = "tfh-best";
const key = (game: string) => `tfh-best-${game}`;

function read(game: string) {
  try {
    return localStorage.getItem(key(game)) ?? "";
  } catch {
    return "";
  }
}

/** your best score for a game (kept only in this browser), or null */
export function useBest(game: string): number | null {
  const raw = useSyncExternalStore(
    (cb) => {
      window.addEventListener(EVENT, cb);
      window.addEventListener("storage", cb);
      return () => {
        window.removeEventListener(EVENT, cb);
        window.removeEventListener("storage", cb);
      };
    },
    () => read(game),
    () => "",
  );
  return raw === "" ? null : Number(raw);
}

export function saveBest(game: string, score: number, lowerIsBetter = false) {
  try {
    const cur = read(game);
    const better = cur === "" || (lowerIsBetter ? score < Number(cur) : score > Number(cur));
    if (better) {
      localStorage.setItem(key(game), String(score));
      window.dispatchEvent(new Event(EVENT));
    }
  } catch {
    // storage blocked: the game still works
  }
}
