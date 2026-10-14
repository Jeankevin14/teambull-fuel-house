"use client";

import { useEffect, useRef, useState } from "react";
import { confetti } from "@/lib/motion";
import { saveBest, useBest } from "@/lib/best";
import { awardBadge, type Award } from "@/lib/badges";
import type { Tier } from "@/config/rewards";
import GameResult from "./GameResult";

const clock = () => performance.now();

const ROUNDS = 10;
const MAX = ROUNDS * 3;
const tierFor = (pts: number): Tier => (pts >= 22 ? "gold" : pts >= 15 ? "silver" : "bronze");

type Zone = { start: number; w: number }; // percent of the track
type Verdict = { text: string; pts: number };

const VERDICT_STYLE = ["bg-red-500", "bg-amber-500", "bg-green-500", "bg-green-600"];

/** position of the sliding bar (0 to 100) at a given time: it goes back and forth */
function posAt(ms: number, speed: number) {
  const p = ((ms / 1000) * speed) % 1;
  return (p < 0.5 ? p * 2 : 2 - p * 2) * 100;
}

function newZone(round: number): Zone {
  const w = Math.max(8, 24 - round * 1.7);
  return { start: 6 + Math.random() * (88 - w), w };
}

export default function PerfectRepGame() {
  const [phase, setPhase] = useState<"idle" | "play" | "done">("idle");
  const [round, setRound] = useState(0);
  const [pos, setPos] = useState(0);
  const [zone, setZone] = useState<Zone>({ start: 40, w: 20 });
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [award, setAward] = useState<Award>(null);
  const best = useBest("rep");

  // the live game numbers sit in a ref so the loop and key press always see the latest values
  const live = useRef({ running: false, t0: 0, speed: 0.5, zone: { start: 40, w: 20 } as Zone, round: 0, scores: [] as number[] });
  const raf = useRef(0);
  const next = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function loop() {
    if (!live.current.running) return;
    setPos(posAt(clock() - live.current.t0, live.current.speed));
    raf.current = requestAnimationFrame(loop);
  }

  function startRound(r: number) {
    const z = newZone(r);
    live.current = { ...live.current, running: true, t0: clock(), speed: 0.42 + r * 0.075, zone: z, round: r };
    setRound(r);
    setZone(z);
    setVerdict(null);
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(loop);
  }

  function start() {
    live.current.scores = [];
    setScores([]);
    setAward(null);
    setPhase("play");
    startRound(0);
  }

  function lift() {
    const L = live.current;
    if (!L.running) return;
    L.running = false;
    cancelAnimationFrame(raf.current);
    const p = posAt(clock() - L.t0, L.speed);
    setPos(p);
    const d = Math.abs(p - (L.zone.start + L.zone.w / 2));
    const v: Verdict =
      d <= L.zone.w * 0.12 ? { text: "Perfect", pts: 3 } : d <= L.zone.w / 2 ? { text: "Good", pts: 2 } : d <= L.zone.w * 0.9 ? { text: "Close", pts: 1 } : { text: "Miss", pts: 0 };
    setVerdict(v);
    L.scores = [...L.scores, v.pts];
    setScores(L.scores);

    next.current = setTimeout(() => {
      if (L.round + 1 >= ROUNDS) {
        const total = L.scores.reduce((a, b) => a + b, 0);
        saveBest("rep", total);
        setAward(awardBadge("rep", tierFor(total)));
        if (total >= 15) confetti(window.innerWidth / 2, window.innerHeight / 3);
        setPhase("done");
      } else {
        startRound(L.round + 1);
      }
    }, 850);
  }

  // Space bar works too; the cleanup stops everything when you leave the page
  const liftRef = useRef(lift);
  useEffect(() => {
    liftRef.current = lift;
  });
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.code === "Space" && live.current.running) {
        e.preventDefault();
        liftRef.current();
      }
    };
    window.addEventListener("keydown", key);
    const l = live.current;
    return () => {
      window.removeEventListener("keydown", key);
      l.running = false;
      cancelAnimationFrame(raf.current);
      clearTimeout(next.current);
    };
  }, []);

  const total = scores.reduce((a, b) => a + b, 0);

  if (phase === "done") {
    return (
      <GameResult
        game="Perfect Rep"
        score={`${total} pts`}
        detail={`Out of ${MAX}. 22 points or more wins Gold.`}
        tier={tierFor(total)}
        best={best === null ? null : `${best} pts`}
        award={award}
        onAgain={() => setPhase("idle")}
      />
    );
  }

  if (phase === "idle") {
    return (
      <div className="mx-auto max-w-xl rounded-3xl bg-foreground p-8 text-center text-white">
        <p className="font-display text-3xl font-bold uppercase">Perfect rep</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-white/70">
          A bar slides across the track. Tap LIFT when it is in the green zone. 10 reps, and the zone gets smaller and the bar faster.
        </p>
        <button type="button" onClick={start} className="btn-shine mt-5 rounded-full bg-accent px-10 py-3.5 text-lg font-bold transition hover:bg-accent-dark">
          Start
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-3 flex items-center justify-between text-sm font-semibold">
        <span>Rep: <span className="tabular-nums text-accent">{round + 1}/{ROUNDS}</span></span>
        {best !== null && <span className="text-xs text-muted">Best: {best}</span>}
        <span>Points: <span className="tabular-nums text-accent">{total}</span></span>
      </div>

      <div className="relative rounded-3xl bg-foreground p-4 sm:p-6">
        <div className="relative h-20 overflow-hidden rounded-2xl bg-white/10 sm:h-24">
          <div
            className="absolute inset-y-0 bg-green-500/80"
            style={{ left: `${zone.start}%`, width: `${zone.w}%` }}
          >
            <span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-white/80" />
          </div>
          <div className="absolute inset-y-1 w-3 -translate-x-1/2 rounded-full bg-accent shadow-[0_0_18px_rgba(220,38,38,.9)]" style={{ left: `${pos}%` }} />
        </div>

        <div className="mt-4 flex h-9 items-center justify-center">
          {verdict && (
            <span className={`anim-pop rounded-full px-5 py-1 font-display text-lg font-bold uppercase text-white ${VERDICT_STYLE[verdict.pts]}`}>
              {verdict.text} {verdict.pts > 0 ? `+${verdict.pts}` : ""}
            </span>
          )}
        </div>

        <button
          type="button"
          onPointerDown={lift}
          disabled={verdict !== null}
          className="btn-shine mt-2 w-full touch-manipulation select-none rounded-full bg-accent py-4 font-display text-2xl font-bold uppercase text-white transition active:scale-[0.98] disabled:opacity-60"
        >
          Lift
        </button>
        <p className="mt-2 text-center text-xs text-white/60">You can also press the space bar.</p>
      </div>

      <div className="mt-4 flex justify-center gap-2" aria-label="Rep results">
        {Array.from({ length: ROUNDS }, (_, i) => (
          <span
            key={i}
            className={`h-3 w-3 rounded-full ${i < scores.length ? VERDICT_STYLE[scores[i]] : i === round ? "bg-accent/40 ring-2 ring-accent" : "bg-line"}`}
          />
        ))}
      </div>
    </div>
  );
}
