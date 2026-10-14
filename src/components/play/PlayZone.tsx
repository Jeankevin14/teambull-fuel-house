"use client";

import { useState } from "react";
import { REWARDS_ENABLED, TIERS } from "@/config/rewards";
import MemoryGame from "./MemoryGame";
import ReflexGame from "./ReflexGame";
import QuizGame from "./QuizGame";
import BadgeShelf from "./BadgeShelf";

const GAMES = [
  { id: "memory", name: "Plate Memory", blurb: "Match 6 pairs in the fewest moves", tag: "Memory" },
  { id: "reflex", name: "Rep Counter Reflex", blurb: "Tap the plates for 30 seconds", tag: "Speed" },
  { id: "quiz", name: "Gym Quiz", blurb: "5 questions on training and food", tag: "Brain" },
] as const;

type Id = (typeof GAMES)[number]["id"];

export default function PlayZone() {
  const [game, setGame] = useState<Id>("memory");
  const rewards = (["gold", "silver"] as const).filter((t) => TIERS[t].reward);

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-3">
        {GAMES.map((g) => {
          const on = g.id === game;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => setGame(g.id)}
              aria-pressed={on}
              className={`relative flex flex-col rounded-2xl border-2 p-4 text-left transition hover:-translate-y-0.5 ${
                on ? "border-accent bg-accent text-white shadow-lg" : "border-line bg-surface hover:border-accent"
              }`}
            >
              <span className={`text-xs font-bold uppercase tracking-widest ${on ? "text-white/80" : "text-accent"}`}>{g.tag}</span>
              <span className="mt-2 font-display text-xl font-bold uppercase leading-tight">{g.name}</span>
              <span className={`mt-1 text-sm ${on ? "text-white/90" : "text-muted"}`}>{g.blurb}</span>
            </button>
          );
        })}
      </div>

      {REWARDS_ENABLED && rewards.length > 0 && (
        <p className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 rounded-2xl bg-accent-soft px-4 py-3 text-center text-sm font-semibold">
          <span className="text-accent">Play and win:</span>
          {rewards.map((t) => (
            <span key={t}>
              {TIERS[t].label}: {TIERS[t].reward}
            </span>
          ))}
        </p>
      )}

      <div key={game} className="bmi-step">
        {game === "memory" && <MemoryGame />}
        {game === "reflex" && <ReflexGame />}
        {game === "quiz" && <QuizGame />}
      </div>

      <BadgeShelf />
    </div>
  );
}
