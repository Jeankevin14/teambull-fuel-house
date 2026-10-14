"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import type { Product } from "@/types";
import {
  ACTIVITY,
  GOALS,
  bmiOf,
  caloriesFor,
  gaugeAngle,
  healthyRangeKg,
  levelOf,
  proteinFor,
  suggestedGoal,
  type Activity,
  type BmiLevel,
  type Gender,
  type Goal,
} from "@/lib/bmi";
import { buildChatUrl } from "@/lib/whatsapp";
import { isInStock } from "@/lib/products";
import { confetti } from "@/lib/motion";
import ProductImage from "@/components/product/ProductImage";

/* ------------------------------------------------------------------ */
/*  Copy and colours                                                   */
/* ------------------------------------------------------------------ */

const LEVELS: Record<BmiLevel, { label: string; color: string; headline: string; text: string }> = {
  under: {
    label: "Underweight",
    color: "#3b82f6",
    headline: "Time to fuel up",
    text: "You are below the healthy range. Eat in a surplus, get enough protein and lift to gain weight the healthy way.",
  },
  normal: {
    label: "Healthy",
    color: "#16a34a",
    headline: "Right in the zone",
    text: "Your weight is in the healthy range. Now build strength and stay consistent.",
  },
  over: {
    label: "Overweight",
    color: "#f59e0b",
    headline: "Slightly above the range",
    text: "Small changes in food and training can bring this down. A clear plan makes it easier.",
  },
  obese: {
    label: "Obese",
    color: "#ea580c",
    headline: "Let's build a plan",
    text: "Steady training and the right nutrition work. Our coaches can guide you step by step.",
  },
  severe: {
    label: "Obese (high)",
    color: "#dc2626",
    headline: "Start with a plan",
    text: "Your BMI is high. Please also get a check-up with your doctor. We can help with training and food habits at a safe pace.",
  },
};

const BANDS = [
  { from: 12, to: 18.5, color: "#3b82f6" },
  { from: 18.5, to: 23, color: "#16a34a" },
  { from: 23, to: 25, color: "#f59e0b" },
  { from: 25, to: 30, color: "#ea580c" },
  { from: 30, to: 40, color: "#dc2626" },
];

const STEPS = ["You", "Height", "Weight", "Goal"] as const;

const GENDERS: { id: Gender; label: string }[] = [
  { id: "male", label: "Male" },
  { id: "female", label: "Female" },
  { id: "other", label: "Other" },
];

const GOAL_HINT: Record<Goal, string> = {
  lose: "Burn fat",
  muscle: "Get stronger",
  maintain: "Stay in shape",
  gain: "Add healthy weight",
};

/* ------------------------------------------------------------------ */
/*  Small helpers                                                      */
/* ------------------------------------------------------------------ */

const subscribeMotion = (cb: () => void) => {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const CX = 120;
const CY = 120;
const R = 96;

function point(angle: number) {
  const a = (angle * Math.PI) / 180;
  return [CX + R * Math.sin(a), CY - R * Math.cos(a)];
}
function arc(from: number, to: number) {
  const [x1, y1] = point(gaugeAngle(from));
  const [x2, y2] = point(gaugeAngle(to));
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

function toFeet(cm: number) {
  const totalIn = Math.round(cm / 2.54);
  return `${Math.floor(totalIn / 12)} ft ${totalIn % 12} in`;
}

function pickCategories(level: BmiLevel, goal: Goal): string[] {
  if (level === "under" || goal === "gain") return ["Mass Gainer", "Whey Protein", "Creatine"];
  if (goal === "muscle") return ["Whey Protein", "Creatine", "BCAA & EAA"];
  if (goal === "maintain") return ["Whey Protein", "BCAA & EAA", "Vitamins"];
  return ["Whey Protein", "BCAA & EAA", "Pre-Workout"];
}

function Gauge({ bmi, color }: { bmi: number; color: string }) {
  const angle = gaugeAngle(bmi);
  const reduce = useSyncExternalStore(subscribeMotion, reducedMotion, () => false);
  return (
    <svg viewBox="0 0 240 140" className="mx-auto w-full max-w-xs" role="img" aria-label={`BMI gauge showing ${bmi.toFixed(1)}`}>
      {BANDS.map((b) => (
        <path key={b.from} d={arc(b.from, b.to)} stroke={b.color} strokeWidth="20" fill="none" />
      ))}
      <g key={bmi} transform={`rotate(${angle} ${CX} ${CY})`}>
        {!reduce && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`-90 ${CX} ${CY}`}
            to={`${angle} ${CX} ${CY}`}
            dur="1.2s"
            begin="0s"
            fill="freeze"
            calcMode="spline"
            keyTimes="0;1"
            keySplines="0.2 0.8 0.2 1"
          />
        )}
        <polygon points={`${CX - 5},${CY} ${CX + 5},${CY} ${CX},${CY - 82}`} fill="#1a1a1a" />
      </g>
      <circle cx={CX} cy={CY} r="9" fill="#1a1a1a" />
      <circle cx={CX} cy={CY} r="4" fill={color} />
      <text x="12" y="136" fontSize="9" fill="#5f6368">12</text>
      <text x="212" y="136" fontSize="9" fill="#5f6368">40+</text>
    </svg>
  );
}

/** A barbell that loads one more pair of plates as the weight goes up. */
function Barbell({ weight }: { weight: number }) {
  const pairs = Math.max(0, Math.min(8, Math.round(((weight - 30) / 170) * 8)));
  const plates = Array.from({ length: 8 }, (_, i) => i);
  return (
    <svg viewBox="0 0 320 100" className="mx-auto w-full max-w-md" aria-hidden="true">
      <rect x="6" y="47" width="308" height="6" rx="3" fill="#9ca3af" />
      {[-1, 1].map((side) =>
        plates.map((i) => {
          const h = 84 - i * 7;
          const w = 11;
          const x = side === -1 ? 104 - (i + 1) * (w + 2) : 216 + i * (w + 2) + 2;
          const on = i < pairs;
          return (
            <rect
              key={`${side}-${i}`}
              x={x}
              y={50 - h / 2}
              width={w}
              height={h}
              rx="3"
              fill={i % 2 === 0 ? "#dc2626" : "#1a1a1a"}
              style={{
                opacity: on ? 1 : 0,
                transform: on ? "scaleY(1)" : "scaleY(0.2)",
                transformBox: "fill-box",
                transformOrigin: "center",
                transition: `opacity .3s ease ${i * 25}ms, transform .3s ease ${i * 25}ms`,
              }}
            />
          );
        }),
      )}
      <rect x="104" y="40" width="6" height="20" rx="2" fill="#6b7280" />
      <rect x="210" y="40" width="6" height="20" rx="2" fill="#6b7280" />
    </svg>
  );
}

function Stepper({
  value,
  onChange,
  min,
  max,
  unit,
  label,
}: {
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  unit: string;
  label: string;
}) {
  const set = (n: number) => onChange(Math.min(max, Math.max(min, n)));
  const btn =
    "flex h-12 w-12 items-center justify-center rounded-full border border-line bg-white text-2xl font-bold transition hover:border-accent hover:text-accent active:scale-95";
  return (
    <div className="flex items-center justify-center gap-5">
      <button type="button" className={btn} onClick={() => set(value - 1)} aria-label={`Decrease ${label}`}>−</button>
      <p className="min-w-28 text-center font-display text-6xl font-bold tabular-nums">
        {value}
        <span className="ml-1 text-xl text-muted">{unit}</span>
      </p>
      <button type="button" className={btn} onClick={() => set(value + 1)} aria-label={`Increase ${label}`}>+</button>
    </div>
  );
}

const chip = (on: boolean) =>
  `rounded-full border px-4 py-2 text-sm font-semibold transition ${
    on ? "border-accent bg-accent text-white" : "border-line bg-white hover:border-accent hover:text-accent"
  }`;

/* ------------------------------------------------------------------ */
/*  The calculator                                                     */
/* ------------------------------------------------------------------ */

export default function BmiCalculator({ products }: { products: Product[] }) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [gender, setGender] = useState<Gender | null>(null);
  const [age, setAge] = useState(25);
  const [cm, setCm] = useState(170);
  const [kg, setKg] = useState(70);
  const [activity, setActivity] = useState<Activity>("light");
  const [goal, setGoal] = useState<Goal>("maintain");
  const [name, setName] = useState("");

  const bmi = bmiOf(kg, cm);
  const level = levelOf(bmi);
  const info = LEVELS[level];
  const g: Gender = gender ?? "other";
  const range = healthyRangeKg(cm);
  const cal = caloriesFor(kg, cm, age, g, activity, goal);
  const protein = proteinFor(kg, goal);
  const suggested = suggestedGoal(level);
  const wantsHelp = level !== "normal";
  const goalLabel = GOALS.find((x) => x.id === goal)?.label ?? "";

  const canNext = step !== 0 || gender !== null;

  function reveal(e: React.MouseEvent<HTMLButtonElement>) {
    // start on the goal that fits the BMI, the user can switch it on the result
    setGoal(suggested);
    setDone(true);
    if (level === "normal") {
      const r = e.currentTarget.getBoundingClientRect();
      confetti(r.left + r.width / 2, r.top);
    }
    requestAnimationFrame(() =>
      document.getElementById("bmi-card")?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }

  const picks: Product[] = [];
  for (const cat of pickCategories(level, goal)) {
    const p = products.find((x) => x.category === cat && isInStock(x));
    if (p) picks.push(p);
  }

  const message = [
    "Hi Team Bull Fuel House! I used your BMI calculator and would like a free consultation.",
    "",
    ...(name.trim() ? [`Name: ${name.trim()}`] : []),
    `Age: ${age} | Gender: ${g[0].toUpperCase()}${g.slice(1)}`,
    `Height: ${cm} cm | Weight: ${kg} kg`,
    `BMI: ${bmi.toFixed(1)} (${info.label})`,
    `Goal: ${goalLabel}`,
    "",
    "Please guide me.",
  ].join("\n");

  return (
    <div id="bmi-card" className="mx-auto max-w-4xl scroll-mt-24">
      {!done ? (
        <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
          {/* progress */}
          <div className="grid grid-cols-4 gap-2 border-b border-line bg-white px-5 py-4">
            {STEPS.map((label, i) => (
              <button
                key={label}
                type="button"
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                aria-current={i === step}
                className="text-left disabled:cursor-default"
              >
                <span className={`block h-1.5 rounded-full transition-colors ${i <= step ? "bg-accent" : "bg-line"}`} />
                <span className={`mt-2 block text-xs font-semibold uppercase tracking-wide ${i === step ? "text-accent" : "text-muted"}`}>
                  {i + 1}. {label}
                </span>
              </button>
            ))}
          </div>

          <div key={step} className="bmi-step flex min-h-[26rem] flex-col justify-between gap-8 px-5 py-8 sm:px-10">
            {step === 0 && (
              <div className="space-y-8">
                <h2 className="text-center font-display text-3xl font-bold uppercase">Who is training?</h2>
                <div className="mx-auto grid max-w-lg grid-cols-3 gap-3">
                  {GENDERS.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setGender(o.id)}
                      aria-pressed={gender === o.id}
                      className={`rounded-2xl border-2 py-5 font-display text-xl font-bold uppercase transition ${
                        gender === o.id ? "border-accent bg-accent-soft text-accent" : "border-line bg-white hover:border-accent"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
                <div>
                  <p className="mb-3 text-center text-sm font-semibold text-muted">Age</p>
                  <Stepper value={age} onChange={setAge} min={18} max={80} unit="yrs" label="age" />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-center font-display text-3xl font-bold uppercase">How tall are you?</h2>
                <p className="text-center font-display text-7xl font-bold tabular-nums">
                  {cm}<span className="ml-1 text-2xl text-muted">cm</span>
                </p>
                <p className="-mt-3 text-center text-muted">{toFeet(cm)}</p>
                <div className="mx-auto max-w-xl">
                  <input
                    type="range"
                    min={120}
                    max={220}
                    value={cm}
                    onChange={(e) => setCm(Number(e.target.value))}
                    aria-label="Height in centimetres"
                    className="h-3 w-full cursor-pointer accent-[#dc2626]"
                  />
                  <div className="mt-1 flex justify-between text-xs text-muted">
                    {[120, 140, 160, 180, 200, 220].map((t) => <span key={t}>{t}</span>)}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <h2 className="text-center font-display text-3xl font-bold uppercase">How much do you weigh?</h2>
                <Barbell weight={kg} />
                <Stepper value={kg} onChange={setKg} min={30} max={200} unit="kg" label="weight" />
                <div className="mx-auto max-w-xl">
                  <input
                    type="range"
                    min={30}
                    max={200}
                    value={kg}
                    onChange={(e) => setKg(Number(e.target.value))}
                    aria-label="Weight in kilograms"
                    className="h-3 w-full cursor-pointer accent-[#dc2626]"
                  />
                </div>
                <p className="text-center">
                  <span
                    className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold text-white transition-colors"
                    style={{ background: info.color }}
                  >
                    BMI {bmi.toFixed(1)} · {info.label}
                  </span>
                </p>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-center font-display text-3xl font-bold uppercase">What is your goal?</h2>
                <div className="mx-auto grid max-w-xl grid-cols-2 gap-3">
                  {GOALS.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setGoal(o.id)}
                      aria-pressed={goal === o.id}
                      className={`rounded-2xl border-2 px-4 py-4 text-left transition ${
                        goal === o.id ? "border-accent bg-accent-soft" : "border-line bg-white hover:border-accent"
                      }`}
                    >
                      <span className={`block font-display text-lg font-bold uppercase ${goal === o.id ? "text-accent" : ""}`}>{o.label}</span>
                      <span className="text-sm text-muted">{GOAL_HINT[o.id]}</span>
                    </button>
                  ))}
                </div>
                <div>
                  <p className="mb-3 text-center text-sm font-semibold text-muted">How active are you?</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {ACTIVITY.map((a) => (
                      <button key={a.id} type="button" onClick={() => setActivity(a.id)} aria-pressed={activity === a.id} className={chip(activity === a.id)}>
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* navigation */}
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className={`rounded-full border border-line bg-white px-6 py-3 font-semibold transition hover:border-accent hover:text-accent ${step === 0 ? "invisible" : ""}`}
              >
                Back
              </button>
              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  disabled={!canNext}
                  onClick={() => setStep(step + 1)}
                  className="rounded-full bg-accent px-9 py-3 font-bold text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {canNext ? "Next" : "Pick one to continue"}
                </button>
              ) : (
                <button type="button" onClick={reveal} className="rounded-full bg-accent px-9 py-3 font-bold text-white transition hover:bg-accent-dark">
                  Show my BMI
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bmi-step space-y-6">
          {/* result */}
          <div className="grid items-center gap-6 rounded-3xl border border-line bg-white p-6 shadow-sm md:grid-cols-2 md:p-8">
            <Gauge bmi={bmi} color={info.color} />
            <div className="text-center md:text-left">
              <p className="font-display text-7xl font-bold leading-none tabular-nums" style={{ color: info.color }}>
                {bmi.toFixed(1)}
              </p>
              <p className="mt-3 inline-block rounded-full px-4 py-1 text-sm font-bold uppercase tracking-wide text-white" style={{ background: info.color }}>
                {info.label}
              </p>
              <h2 className="mt-3 font-display text-2xl font-bold uppercase">{info.headline}</h2>
              <p className="mt-1 text-sm text-muted">{info.text}</p>
              <p className="mt-3 text-sm">
                Healthy weight for {cm} cm: <strong>{range.min}–{range.max} kg</strong>
              </p>
            </div>
          </div>

          {/* consultation */}
          <div className={`grid items-center gap-5 rounded-3xl p-6 md:grid-cols-[1fr_auto] md:p-8 ${wantsHelp ? "bg-accent text-white" : "border border-line bg-accent-soft"}`}>
            <div>
              <h3 className="font-display text-3xl font-bold uppercase">{wantsHelp ? "Get a free consultation" : "Want a coach on your side?"}</h3>
              <p className={`mt-1 text-sm ${wantsHelp ? "text-white/90" : "text-muted"}`}>
                {wantsHelp
                  ? "Talk to the Team Bull coaches. We will look at your numbers and suggest a simple plan for your goal."
                  : "Chat with Team Bull for training, food and supplement tips for your goal."}
              </p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
                placeholder="Your name (optional)"
                aria-label="Your name (optional)"
                className="mt-4 w-full max-w-xs rounded-full border border-transparent bg-white px-5 py-2.5 text-sm text-foreground outline-none focus:border-foreground"
              />
            </div>
            <a
              href={buildChatUrl(message)}
              target="_blank"
              rel="noopener noreferrer"
              className={`whitespace-nowrap rounded-full px-8 py-3.5 text-center font-bold transition ${wantsHelp ? "bg-white text-accent hover:bg-red-50" : "bg-accent text-white hover:bg-accent-dark"}`}
            >
              Chat on WhatsApp
            </a>
          </div>

          {/* goal switcher + numbers */}
          <div className="rounded-3xl border border-line bg-surface p-6 md:p-8">
            <p className="text-center text-xs font-semibold uppercase tracking-widest text-accent md:text-left">Your goal</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2 md:justify-start">
              {GOALS.map((o) => (
                <button key={o.id} type="button" onClick={() => setGoal(o.id)} aria-pressed={goal === o.id} className={chip(goal === o.id)}>
                  {o.label}
                  {o.id === suggested && <span className="ml-1.5 text-xs opacity-80">★ best fit</span>}
                </button>
              ))}
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-5 text-center md:text-left">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted">Calories per day</p>
                <p className="mt-1 font-display text-5xl font-bold tabular-nums">
                  {cal.target.toLocaleString("en-IN")}<span className="ml-1 text-lg text-muted">kcal</span>
                </p>
                <p className="mt-1 text-xs text-muted">Maintenance: {cal.maintenance.toLocaleString("en-IN")} kcal</p>
              </div>
              <div className="rounded-2xl bg-white p-5 text-center md:text-left">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted">Protein per day</p>
                <p className="mt-1 font-display text-5xl font-bold tabular-nums">
                  {protein.min}–{protein.max}<span className="ml-1 text-lg text-muted">g</span>
                </p>
                <p className="mt-1 text-xs">
                  <Link href="/protein-calculator" className="text-muted underline hover:text-accent">Protein calculator</Link>
                </p>
              </div>
            </div>
          </div>

          {/* picks */}
          {picks.length > 0 && (
            <div>
              <h3 className="text-center font-display text-2xl font-bold uppercase md:text-left">Picked for you</h3>
              <div className="mt-3 grid gap-4 sm:grid-cols-3">
                {picks.map((p) => (
                  <Link key={p.id} href={`/products/${p.id}`} className="group overflow-hidden rounded-2xl border border-line bg-surface transition hover:-translate-y-0.5 hover:border-accent">
                    <ProductImage product={p} className="h-32" letterSize="text-3xl" />
                    <div className="p-4">
                      <p className="text-xs uppercase tracking-wide text-accent">{p.category}</p>
                      <p className="text-sm font-semibold leading-snug">{p.name}</p>
                      <p className="mt-2 text-sm font-semibold text-accent group-hover:underline">View product →</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setDone(false);
                setStep(0);
              }}
              className="rounded-full border border-line bg-white px-6 py-3 font-semibold transition hover:border-accent hover:text-accent"
            >
              Start again
            </button>
          </div>
        </div>
      )}

      <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-muted">
        BMI is a screening number and can read high for muscular people. It uses Asian cut-offs (overweight from 23, obese
        from 25). Calories and protein are estimates, not medical advice. Nothing you enter is saved.
      </p>
    </div>
  );
}
