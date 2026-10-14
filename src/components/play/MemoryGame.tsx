"use client";

import { useRef, useState, type ReactNode } from "react";
import { confetti } from "@/lib/motion";
import { saveBest, useBest } from "@/lib/best";
import { awardBadge, type Award } from "@/lib/badges";
import type { Tier } from "@/config/rewards";
import GameResult from "./GameResult";

const ICONS: ReactNode[] = [
  // dumbbell
  <svg key="d" viewBox="0 0 24 24" className="h-10 w-10"><rect x="1" y="8" width="3.5" height="8" rx="1" fill="#dc2626" /><rect x="4.5" y="6" width="3" height="12" rx="1" fill="#1a1a1a" /><rect x="7.5" y="11" width="9" height="2" fill="#6b7280" /><rect x="16.5" y="6" width="3" height="12" rx="1" fill="#1a1a1a" /><rect x="19.5" y="8" width="3.5" height="8" rx="1" fill="#dc2626" /></svg>,
  // plate
  <svg key="p" viewBox="0 0 24 24" className="h-10 w-10"><circle cx="12" cy="12" r="10" fill="#1a1a1a" /><circle cx="12" cy="12" r="6.5" fill="none" stroke="#dc2626" strokeWidth="1.5" /><circle cx="12" cy="12" r="2.2" fill="#fff" /></svg>,
  // tub
  <svg key="t" viewBox="0 0 24 24" className="h-10 w-10"><rect x="5" y="3" width="14" height="4" rx="1.5" fill="#1a1a1a" /><rect x="4" y="7" width="16" height="15" rx="2.5" fill="#dc2626" /><rect x="7" y="11" width="10" height="6" rx="1" fill="#fff" /></svg>,
  // bolt
  <svg key="b" viewBox="0 0 24 24" className="h-10 w-10"><path d="M13.5 2L4.5 13.5H11L9.5 22l9-11.5H12z" fill="#f59e0b" stroke="#1a1a1a" strokeWidth="1" strokeLinejoin="round" /></svg>,
  // kettlebell
  <svg key="k" viewBox="0 0 24 24" className="h-10 w-10"><path d="M8 9a4 4 0 0 1 8 0" fill="none" stroke="#1a1a1a" strokeWidth="2.2" strokeLinecap="round" /><circle cx="12" cy="15" r="7" fill="#dc2626" /><circle cx="9.5" cy="13" r="1.6" fill="#fff" opacity=".35" /></svg>,
  // flame
  <svg key="f" viewBox="0 0 24 24" className="h-10 w-10"><path d="M12 2c1 4 6 6 6 11a6 6 0 0 1-12 0c0-2 1-3.5 2.2-4.5.2 1.8 1 2.6 2 2.8C9.5 8 10 5 12 2z" fill="#ea580c" stroke="#1a1a1a" strokeWidth="1" strokeLinejoin="round" /></svg>,
];

type Card = { id: number; icon: number };

function deal(): Card[] {
  const cards = ICONS.flatMap((_, icon) => [0, 1].map((n) => ({ id: icon * 2 + n, icon })));
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

const tierFor = (moves: number): Tier => (moves <= 10 ? "gold" : moves <= 14 ? "silver" : "bronze");

export default function MemoryGame() {
  const [cards, setCards] = useState<Card[] | null>(null);
  const [open, setOpen] = useState<number[]>([]); // ids face up right now
  const [matched, setMatched] = useState<number[]>([]); // icons found
  const [moves, setMoves] = useState(0);
  const [done, setDone] = useState(false);
  const [award, setAward] = useState<Award>(null);
  const lock = useRef(false);
  const best = useBest("memory");

  function restart() {
    setCards(deal());
    setOpen([]);
    setMatched([]);
    setMoves(0);
    setDone(false);
    setAward(null);
    lock.current = false;
  }

  function flip(c: Card) {
    if (!cards) return;
    if (lock.current || open.includes(c.id) || matched.includes(c.icon)) return;
    const next = [...open, c.id];
    setOpen(next);
    if (next.length < 2) return;

    const m = moves + 1;
    setMoves(m);
    lock.current = true;
    const [a, b] = next.map((id) => cards.find((x) => x.id === id)!);
    setTimeout(() => {
      if (a.icon === b.icon) {
        const found = [...matched, a.icon];
        setMatched(found);
        if (found.length === ICONS.length) {
          saveBest("memory", m, true);
          setAward(awardBadge("memory", tierFor(m)));
          confetti(window.innerWidth / 2, window.innerHeight / 3);
          setTimeout(() => setDone(true), 600);
        }
      }
      setOpen([]);
      lock.current = false;
    }, 750);
  }

  if (!cards) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl bg-foreground p-8 text-center text-white">
        <p className="font-display text-3xl font-bold uppercase">Plate memory</p>
        <p className="mx-auto mt-2 max-w-xs text-sm text-white/70">Flip the cards and match all 6 pairs in as few moves as you can.</p>
        <button type="button" onClick={restart} className="btn-shine mt-5 rounded-full bg-accent px-10 py-3.5 text-lg font-bold transition hover:bg-accent-dark">
          Start
        </button>
      </div>
    );
  }

  if (done) {
    return (
      <GameResult
        game="Plate Memory"
        score={`${moves} moves`}
        detail="Fewer moves is better. 10 or less wins Gold."
        tier={tierFor(moves)}
        best={best === null ? null : `${best} moves`}
        award={award}
        onAgain={restart}
      />
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-4 flex items-center justify-between text-sm font-semibold">
        <span>Moves: <span className="tabular-nums text-accent">{moves}</span></span>
        <span>Pairs: <span className="tabular-nums text-accent">{matched.length}/{ICONS.length}</span></span>
        <button type="button" onClick={restart} className="rounded-full border border-line px-4 py-1.5 text-xs transition hover:border-accent hover:text-accent">
          Restart
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
        {cards.map((c) => {
          const show = open.includes(c.id) || matched.includes(c.icon);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => flip(c)}
              aria-label={show ? "Card" : "Hidden card"}
              className="mem-card aspect-square w-full"
            >
              <span className="mem-inner" data-open={show}>
                <span className="mem-face bg-accent font-display text-2xl font-bold text-white shadow">TB</span>
                <span className={`mem-face mem-front border-2 bg-white ${matched.includes(c.icon) ? "border-green-500" : "border-line"}`}>
                  {ICONS[c.icon]}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-center text-sm text-muted">Match all 6 pairs in as few moves as you can.</p>
    </div>
  );
}
