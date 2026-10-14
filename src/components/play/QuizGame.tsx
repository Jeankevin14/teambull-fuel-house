"use client";

import { useState } from "react";
import { confetti } from "@/lib/motion";
import { saveBest, useBest } from "@/lib/best";
import type { Tier } from "@/config/rewards";
import GameResult from "./GameResult";

type Q = { q: string; a: string; wrong: string[]; why: string };

const BANK: Q[] = [
  { q: "About how much protein is in one scoop of whey?", a: "About 24 g", wrong: ["About 5 g", "About 50 g", "About 80 g"], why: "A typical scoop gives roughly 20 to 25 g of protein." },
  { q: "Which nutrient has the most calories per gram?", a: "Fat", wrong: ["Protein", "Carbohydrate", "Water"], why: "Fat has 9 kcal per gram. Protein and carbs have 4." },
  { q: "A usual daily dose of creatine monohydrate is…", a: "3 to 5 g", wrong: ["30 to 50 g", "100 g", "0.1 g"], why: "3 to 5 g a day, taken regularly, is the common dose." },
  { q: "When do muscles actually grow?", a: "While you recover and sleep", wrong: ["Only during the workout", "While you fast for days", "Only when you sweat a lot"], why: "Training is the signal. Growth happens during rest and sleep." },
  { q: "What does BCAA stand for?", a: "Branched-Chain Amino Acids", wrong: ["Best Cardio And Abs", "Body Carb And Activity", "Basic Creatine Amino Acid"], why: "Leucine, isoleucine and valine are the three BCAAs." },
  { q: "Progressive overload means…", a: "Slowly increasing the demand on your muscles", wrong: ["Lifting the same weight forever", "Training only once a month", "Skipping rest days"], why: "More weight, reps or sets over time keeps you improving." },
  { q: "Which vitamin does your skin make from sunlight?", a: "Vitamin D", wrong: ["Vitamin C", "Vitamin B12", "Vitamin K"], why: "Sunlight helps your skin make vitamin D." },
  { q: "How much sleep helps most adults recover well?", a: "7 to 9 hours", wrong: ["2 to 3 hours", "4 to 5 hours", "12 to 14 hours"], why: "Most adults recover best with 7 to 9 hours." },
  { q: "The main stimulant in most pre-workouts is…", a: "Caffeine", wrong: ["Sugar", "Salt", "Calcium"], why: "Caffeine boosts energy and focus. Do not overdo it." },
  { q: "Calories in 1 g of protein:", a: "4 kcal", wrong: ["1 kcal", "9 kcal", "12 kcal"], why: "Protein and carbohydrate both give about 4 kcal per gram." },
  { q: "A squat mainly trains your…", a: "Legs and glutes", wrong: ["Biceps", "Forearms", "Neck"], why: "Quads, glutes and hamstrings do most of the work." },
  { q: "Which of these is a complete protein source?", a: "Eggs", wrong: ["Sugar", "White rice only", "Olive oil"], why: "Eggs contain all nine essential amino acids." },
];

type Item = { q: string; options: string[]; a: string; why: string };

function shuffle<T>(list: T[]): T[] {
  const x = [...list];
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
}

const tierFor = (n: number): Tier => (n === 5 ? "gold" : n === 4 ? "silver" : "bronze");

export default function QuizGame() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const best = useBest("quiz");

  function start() {
    setItems(
      shuffle(BANK)
        .slice(0, 5)
        .map((q) => ({ q: q.q, a: q.a, why: q.why, options: shuffle([q.a, ...q.wrong]) })),
    );
    setI(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  }

  if (done) {
    return (
      <GameResult
        game="Gym Quiz"
        score={`${score}/5`}
        detail="Get all 5 right for Gold, 4 for Silver."
        tier={tierFor(score)}
        best={best === null ? null : `${best}/5`}
        onAgain={() => setItems(null)}
      />
    );
  }

  if (!items) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl bg-foreground p-8 text-center text-white">
        <p className="font-display text-3xl font-bold uppercase">Gym quiz</p>
        <p className="mx-auto mt-2 max-w-xs text-sm text-white/70">5 quick questions on training, food and supplements. Fresh questions every time.</p>
        <button type="button" onClick={start} className="btn-shine mt-5 rounded-full bg-accent px-10 py-3.5 text-lg font-bold transition hover:bg-accent-dark">
          Start
        </button>
      </div>
    );
  }

  const cur = items[i];
  const last = i === items.length - 1;

  function pick(o: string) {
    if (picked !== null) return;
    setPicked(o);
    if (o === cur.a) setScore((s) => s + 1);
  }

  function next() {
    if (last) {
      saveBest("quiz", score);
      if (score >= 4) confetti(window.innerWidth / 2, window.innerHeight / 3);
      setDone(true);
    } else {
      setI(i + 1);
      setPicked(null);
    }
  }

  return (
    <div key={i} className="bmi-step mx-auto max-w-xl rounded-3xl border border-line bg-white p-5 shadow-sm sm:p-8">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-muted">
        <span>Question {i + 1} of {items.length}</span>
        <span>Score {score}</span>
      </div>
      <div className="mt-2 grid grid-cols-5 gap-1.5">
        {items.map((_, n) => (
          <span key={n} className={`h-1.5 rounded-full ${n <= i ? "bg-accent" : "bg-line"}`} />
        ))}
      </div>
      <h3 className="mt-5 font-display text-2xl font-bold leading-snug">{cur.q}</h3>
      <div className="mt-4 grid gap-2.5">
        {cur.options.map((o) => {
          const right = picked !== null && o === cur.a;
          const wrong = picked === o && o !== cur.a;
          return (
            <button
              key={o}
              type="button"
              onClick={() => pick(o)}
              disabled={picked !== null}
              className={`rounded-2xl border-2 px-4 py-3 text-left font-semibold transition ${
                right ? "border-green-500 bg-green-50 text-green-800" : wrong ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface hover:border-accent"
              } disabled:cursor-default`}
            >
              {o}
              {right && <span className="float-right">✓</span>}
              {wrong && <span className="float-right">✗</span>}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="anim-fade mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-sm text-sm text-muted">{cur.why}</p>
          <button type="button" onClick={next} className="rounded-full bg-accent px-8 py-2.5 font-bold text-white transition hover:bg-accent-dark">
            {last ? "See result" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
}
