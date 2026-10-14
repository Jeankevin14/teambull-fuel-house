"use client";

import { useEffect, useRef, useState } from "react";
import { confetti } from "@/lib/motion";
import { saveBest, useBest } from "@/lib/best";
import type { Tier } from "@/config/rewards";
import GameResult from "./GameResult";

const SECONDS = 30;
const tierFor = (hits: number): Tier => (hits >= 26 ? "gold" : hits >= 18 ? "silver" : "bronze");

export default function ReflexGame() {
  const [phase, setPhase] = useState<"idle" | "run" | "done">("idle");
  const [hits, setHits] = useState(0);
  const [left, setLeft] = useState(SECONDS);
  const [target, setTarget] = useState<{ x: number; y: number; k: number } | null>(null);
  const [avg, setAvg] = useState(0);
  const best = useBest("reflex");

  const hitsRef = useRef(0);
  const endAt = useRef(0);
  const spawnAt = useRef(0);
  const times = useRef<number[]>([]);
  const tick = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const hide = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const key = useRef(0);

  useEffect(
    () => () => {
      clearInterval(tick.current);
      clearTimeout(hide.current);
    },
    [],
  );

  function finish() {
    clearInterval(tick.current);
    clearTimeout(hide.current);
    setTarget(null);
    const n = hitsRef.current;
    const t = times.current;
    setAvg(t.length ? Math.round(t.reduce((a, b) => a + b, 0) / t.length) : 0);
    saveBest("reflex", n);
    if (n >= 18) confetti(window.innerWidth / 2, window.innerHeight / 3);
    setPhase("done");
  }

  function spawn() {
    clearTimeout(hide.current);
    if (Date.now() >= endAt.current) return finish();
    const life = Math.max(650, 1150 - hitsRef.current * 18);
    key.current += 1;
    setTarget({ x: 6 + Math.random() * 78, y: 8 + Math.random() * 70, k: key.current });
    spawnAt.current = performance.now();
    hide.current = setTimeout(spawn, life);
  }

  function start() {
    hitsRef.current = 0;
    times.current = [];
    setHits(0);
    setLeft(SECONDS);
    endAt.current = Date.now() + SECONDS * 1000;
    setPhase("run");
    tick.current = setInterval(() => {
      const r = Math.ceil((endAt.current - Date.now()) / 1000);
      setLeft(Math.max(0, r));
      if (r <= 0) finish();
    }, 200);
    spawn();
  }

  function hit() {
    hitsRef.current += 1;
    times.current.push(performance.now() - spawnAt.current);
    setHits(hitsRef.current);
    spawn();
  }

  if (phase === "done") {
    return (
      <GameResult
        game="Rep Counter Reflex"
        score={`${hits} reps`}
        detail={`Average reaction ${avg} ms. 26 reps wins Gold.`}
        tier={tierFor(hits)}
        best={best === null ? null : `${best} reps`}
        onAgain={() => setPhase("idle")}
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-3 flex items-center justify-between text-sm font-semibold">
        <span>Reps: <span className="tabular-nums text-accent">{hits}</span></span>
        {best !== null && <span className="text-xs text-muted">Best: {best}</span>}
        <span>Time: <span className="tabular-nums text-accent">{left}s</span></span>
      </div>
      <div className="relative aspect-[4/3] touch-manipulation select-none overflow-hidden rounded-3xl border border-line bg-foreground sm:aspect-[16/10]">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-white/10">
          <div className="h-full bg-accent transition-[width] duration-200 ease-linear" style={{ width: `${phase === "run" ? (left / SECONDS) * 100 : 100}%` }} />
        </div>
        {phase === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center text-white">
            <p className="font-display text-3xl font-bold uppercase">Tap every plate</p>
            <p className="max-w-xs text-sm text-white/70">Plates pop up and vanish fast. Tap as many as you can in 30 seconds.</p>
            <button type="button" onClick={start} className="btn-shine rounded-full bg-accent px-10 py-3.5 text-lg font-bold transition hover:bg-accent-dark">
              Start
            </button>
          </div>
        )}
        {phase === "run" && target && (
          <button
            key={target.k}
            type="button"
            onPointerDown={hit}
            aria-label="Tap the plate"
            className="anim-pop absolute flex h-16 w-16 items-center justify-center rounded-full bg-accent shadow-[0_0_0_6px_rgba(220,38,38,.3)] sm:h-20 sm:w-20"
            style={{ left: `${target.x}%`, top: `${target.y}%` }}
          >
            <span className="h-6 w-6 rounded-full bg-foreground ring-4 ring-white sm:h-8 sm:w-8" />
          </button>
        )}
      </div>
    </div>
  );
}
