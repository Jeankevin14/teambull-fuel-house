"use client";

import Link from "next/link";
import { useState, useSyncExternalStore, type FormEvent } from "react";
import type { Product } from "@/types";
import {
  ACTIVITY,
  GOALS,
  LIMITS,
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
import { formatPrice } from "@/lib/format";
import { isInStock, startingPrice } from "@/lib/products";
import ProductImage from "@/components/product/ProductImage";

const LEVELS: Record<
  BmiLevel,
  { label: string; color: string; headline: string; text: string }
> = {
  under: {
    label: "Underweight",
    color: "#3b82f6",
    headline: "Your body needs more fuel",
    text: "You are below the healthy range. A steady calorie surplus, enough protein and strength training can help you gain weight the healthy way.",
  },
  normal: {
    label: "Healthy weight",
    color: "#16a34a",
    headline: "Great, you are in the healthy range",
    text: "Now it is about building strength, staying consistent and fuelling your training well.",
  },
  over: {
    label: "Overweight",
    color: "#f59e0b",
    headline: "A little above the healthy range",
    text: "Small changes in food and training can bring this down. A clear plan makes it much easier.",
  },
  obese: {
    label: "Obese",
    color: "#ea580c",
    headline: "Let us build a plan together",
    text: "Your BMI is in the obese range. The good news is that steady training and the right nutrition work. Our coaches can guide you step by step.",
  },
  severe: {
    label: "Obese (high)",
    color: "#dc2626",
    headline: "Let us start with a plan, step by step",
    text: "Your BMI is high. We recommend a check-up with your doctor too, and our coaches can help you with training and food habits at a safe pace.",
  },
};

// gauge colours by BMI band (Asian cut-offs)
const BANDS = [
  { from: 12, to: 18.5, color: "#3b82f6" },
  { from: 18.5, to: 23, color: "#16a34a" },
  { from: 23, to: 25, color: "#f59e0b" },
  { from: 25, to: 30, color: "#ea580c" },
  { from: 30, to: 40, color: "#dc2626" },
];

const CX = 120;
const CY = 120;
const R = 96;

function point(angle: number, r = R) {
  const a = (angle * Math.PI) / 180;
  return [CX + r * Math.sin(a), CY - r * Math.cos(a)];
}

function arc(from: number, to: number) {
  const [x1, y1] = point(gaugeAngle(from));
  const [x2, y2] = point(gaugeAngle(to));
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

const subscribeMotion = (cb: () => void) => {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function Gauge({ bmi, color }: { bmi: number; color: string }) {
  const angle = gaugeAngle(bmi);
  const reduce = useSyncExternalStore(subscribeMotion, reducedMotion, () => false);
  return (
    <svg
      viewBox="0 0 240 150"
      className="mx-auto w-full max-w-sm"
      role="img"
      aria-label={`BMI gauge showing ${bmi.toFixed(1)}`}
    >
      {BANDS.map((b) => (
        <path
          key={b.from}
          d={arc(b.from, b.to)}
          stroke={b.color}
          strokeWidth="20"
          fill="none"
          opacity="0.9"
        />
      ))}
      {/* needle (key restarts the swing on every new result) */}
      <g key={bmi} transform={`rotate(${angle} ${CX} ${CY})`}>
        {!reduce && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`-90 ${CX} ${CY}`}
            to={`${angle} ${CX} ${CY}`}
            dur="1.1s"
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
      <text x="14" y="142" fontSize="9" fill="#5f6368">12</text>
      <text x="213" y="142" fontSize="9" fill="#5f6368">40+</text>
    </svg>
  );
}

function pickCategories(level: BmiLevel, goal: Goal): string[] {
  if (level === "under" || goal === "gain") return ["Mass Gainer", "Whey Protein", "Creatine"];
  if (goal === "muscle") return ["Whey Protein", "Creatine", "BCAA & EAA"];
  if (goal === "maintain") return ["Whey Protein", "BCAA & EAA", "Vitamins"];
  return ["Whey Protein", "BCAA & EAA", "Pre-Workout"];
}

const inputCls =
  "mt-2 w-full rounded-full border border-line bg-white px-5 py-3 outline-none focus:border-accent";

type Result = {
  bmi: number;
  level: BmiLevel;
  kg: number;
  cm: number;
  age: number;
  gender: Gender;
  goal: Goal;
  name: string;
};

export default function BmiCalculator({ products }: { products: Product[] }) {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [unit, setUnit] = useState<"cm" | "ft">("cm");
  const [cm, setCm] = useState("");
  const [ft, setFt] = useState("");
  const [inch, setInch] = useState("");
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState<Activity>("light");
  const [goal, setGoal] = useState<Goal>("maintain");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const a = Number(age);
    const kg = Number(weight);
    const h = unit === "cm" ? Number(cm) : Math.round((Number(ft) * 12 + Number(inch || 0)) * 2.54);

    if (!(a >= 1 && a <= 120) || !age) return setError("Please enter your age.");
    if (a < LIMITS.age[0])
      return setError(
        "BMI for under-18s needs special growth charts. Please ask a doctor, or message us on WhatsApp.",
      );
    if (a > LIMITS.age[1]) return setError(`Please enter an age up to ${LIMITS.age[1]}.`);
    if (!(h >= LIMITS.heightCm[0] && h <= LIMITS.heightCm[1]))
      return setError(`Please enter a height between ${LIMITS.heightCm[0]} and ${LIMITS.heightCm[1]} cm.`);
    if (!(kg >= LIMITS.weightKg[0] && kg <= LIMITS.weightKg[1]))
      return setError(`Please enter a weight between ${LIMITS.weightKg[0]} and ${LIMITS.weightKg[1]} kg.`);

    setError("");
    const bmi = bmiOf(kg, h);
    setResult({ bmi, level: levelOf(bmi), kg, cm: h, age: a, gender, goal, name: name.trim() });
    // bring the result into view
    requestAnimationFrame(() =>
      document.getElementById("bmi-result")?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }

  function reset() {
    setResult(null);
    setError("");
  }

  const info = result ? LEVELS[result.level] : null;
  const range = result ? healthyRangeKg(result.cm) : null;
  const cal = result ? caloriesFor(result.kg, result.cm, result.age, result.gender, activity, result.goal) : null;
  const protein = result ? proteinFor(result.kg, result.goal) : null;
  const wantsHelp = result ? result.level !== "normal" : false;
  const goalLabel = result ? GOALS.find((g) => g.id === result.goal)?.label : "";
  const suggested = result ? suggestedGoal(result.level) : "maintain";

  const picks: Product[] = [];
  if (result) {
    for (const cat of pickCategories(result.level, result.goal)) {
      const p = products.find((x) => x.category === cat && isInStock(x));
      if (p) picks.push(p);
    }
  }

  const consultMsg = result
    ? [
        "Hi Team Bull Fuel House! I used your BMI calculator and would like a free consultation.",
        "",
        ...(result.name ? [`Name: ${result.name}`] : []),
        `Age: ${result.age} | Gender: ${result.gender[0].toUpperCase()}${result.gender.slice(1)}`,
        `Height: ${Math.round(result.cm)} cm | Weight: ${result.kg} kg`,
        `BMI: ${result.bmi.toFixed(1)} (${info?.label})`,
        `Goal: ${goalLabel}`,
        "",
        "Please guide me.",
      ].join("\n")
    : "";

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* ---------- form ---------- */}
      <form onSubmit={onSubmit} className="rounded-2xl border border-line bg-surface p-6" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold">Age</span>
            <input type="number" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 28" className={inputCls} />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">Gender</span>
            <select value={gender} onChange={(e) => setGender(e.target.value as Gender)} className={inputCls}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </label>

          <div className="sm:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Height</span>
              <div className="flex rounded-full border border-line bg-white p-0.5 text-xs font-semibold">
                {(["cm", "ft"] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUnit(u)}
                    aria-pressed={unit === u}
                    className={`rounded-full px-3 py-1 ${unit === u ? "bg-accent text-white" : "text-muted"}`}
                  >
                    {u === "cm" ? "cm" : "ft / in"}
                  </button>
                ))}
              </div>
            </div>
            {unit === "cm" ? (
              <input type="number" inputMode="decimal" value={cm} onChange={(e) => setCm(e.target.value)} placeholder="e.g. 170" className={inputCls} aria-label="Height in centimetres" />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <input type="number" inputMode="numeric" value={ft} onChange={(e) => setFt(e.target.value)} placeholder="ft, e.g. 5" className={inputCls} aria-label="Height, feet" />
                <input type="number" inputMode="numeric" value={inch} onChange={(e) => setInch(e.target.value)} placeholder="in, e.g. 7" className={inputCls} aria-label="Height, inches" />
              </div>
            )}
          </div>

          <label className="block">
            <span className="text-sm font-semibold">Weight (kg)</span>
            <input type="number" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 72" className={inputCls} />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">Your goal</span>
            <select value={goal} onChange={(e) => setGoal(e.target.value as Goal)} className={inputCls}>
              {GOALS.map((g) => (
                <option key={g.id} value={g.id}>{g.label}</option>
              ))}
            </select>
          </label>

          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold">How active are you?</span>
            <select value={activity} onChange={(e) => setActivity(e.target.value as Activity)} className={inputCls}>
              {ACTIVITY.map((a) => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
          </label>

          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold">
              Your name <span className="font-normal text-muted">(optional, used only in your WhatsApp message)</span>
            </span>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Arun" className={inputCls} maxLength={40} />
          </label>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-accent-soft px-4 py-3 text-sm text-accent">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="submit" className="rounded-full bg-accent px-8 py-3 font-bold text-white transition hover:bg-accent-dark">
            Calculate my BMI
          </button>
          {result && (
            <button type="button" onClick={reset} className="rounded-full border border-line bg-white px-6 py-3 font-semibold hover:border-accent hover:text-accent">
              Start again
            </button>
          )}
        </div>
        <p className="mt-4 text-xs text-muted">
          Your details stay in your browser. Nothing is saved or sent unless you tap a WhatsApp button.
        </p>
      </form>

      {/* ---------- result ---------- */}
      <div id="bmi-result" className="scroll-mt-24">
        {!result || !info || !range || !cal || !protein ? (
          <div className="flex h-full min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-line p-8 text-center text-muted">
            <Gauge bmi={21} color="#16a34a" />
            <p className="mt-2 font-display text-lg uppercase text-foreground">Your result appears here</p>
            <p className="text-sm">Fill in your details and tap Calculate.</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="rounded-2xl border border-line bg-white p-6 text-center shadow-sm">
              <Gauge bmi={result.bmi} color={info.color} />
              <p className="-mt-2 font-display text-6xl font-bold" style={{ color: info.color }}>
                {result.bmi.toFixed(1)}
              </p>
              <p className="mt-1 inline-block rounded-full px-4 py-1 text-sm font-bold uppercase tracking-wide text-white" style={{ background: info.color }}>
                {info.label}
              </p>
              <p className="mt-3 font-display text-xl font-bold uppercase">{info.headline}</p>
              <p className="mx-auto mt-1 max-w-md text-sm text-muted">{info.text}</p>
              <p className="mt-3 text-sm">
                Healthy weight for your height:{" "}
                <strong>{range.min}–{range.max} kg</strong>
              </p>
            </div>

            {/* free consultation */}
            <div className={`rounded-2xl p-6 ${wantsHelp ? "bg-accent text-white" : "border border-line bg-accent-soft"}`}>
              <p className="font-display text-2xl font-bold uppercase">
                {wantsHelp ? "Get a FREE consultation" : "Want a coach on your side?"}
              </p>
              <p className={`mt-1 text-sm ${wantsHelp ? "text-white/90" : "text-muted"}`}>
                {wantsHelp
                  ? "Talk to the Team Bull coaches. We will look at your numbers and suggest a simple training and food plan. No cost, no pressure."
                  : "Chat with Team Bull for free tips on training, nutrition and the right supplements for your goal."}
              </p>
              <a
                href={buildChatUrl(consultMsg)}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-4 inline-block rounded-full px-7 py-3 font-bold transition ${wantsHelp ? "bg-white text-accent hover:bg-red-50" : "bg-accent text-white hover:bg-accent-dark"}`}
              >
                Book free consultation on WhatsApp
              </a>
              <p className={`mt-2 text-xs ${wantsHelp ? "text-white/80" : "text-muted"}`}>
                Your numbers are filled in for you in the message.
              </p>
            </div>

            {/* calories + protein */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-line bg-surface p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-accent">Daily calories · {goalLabel}</p>
                <p className="mt-1 font-display text-4xl font-bold">{cal.target.toLocaleString("en-IN")} <span className="text-lg">kcal</span></p>
                <p className="mt-1 text-xs text-muted">To stay at your weight: about {cal.maintenance.toLocaleString("en-IN")} kcal.</p>
              </div>
              <div className="rounded-2xl border border-line bg-surface p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-accent">Daily protein</p>
                <p className="mt-1 font-display text-4xl font-bold">{protein.min}–{protein.max} <span className="text-lg">g</span></p>
                <p className="mt-1 text-xs text-muted">
                  <Link href="/protein-calculator" className="underline hover:text-accent">Open the protein calculator</Link>
                </p>
              </div>
            </div>
            {result.goal !== suggested && result.level !== "normal" && (
              <p className="text-sm text-muted">
                Tip: for your BMI, most people start with{" "}
                <strong>{GOALS.find((g) => g.id === suggested)?.label}</strong>. Change your goal and calculate again to compare.
              </p>
            )}

            {/* product picks */}
            {picks.length > 0 && (
              <div>
                <p className="font-display text-xl font-bold uppercase">Picked for your goal</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {picks.map((p) => (
                    <Link key={p.id} href={`/products/${p.id}`} className="overflow-hidden rounded-xl border border-line bg-surface transition hover:border-accent">
                      <ProductImage product={p} className="h-28" letterSize="text-3xl" />
                      <div className="p-3">
                        <p className="text-xs uppercase tracking-wide text-accent">{p.category}</p>
                        <p className="text-sm font-semibold leading-snug">{p.name}</p>
                        <p className="mt-1 text-sm text-muted">From {formatPrice(startingPrice(p))}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-muted lg:col-span-2">
        BMI is a general screening number and does not show body fat, so very muscular people can score high. Results use
        Asian BMI cut-offs (overweight from 23, obese from 25). Calories and protein are estimates for healthy adults.
        This is not medical advice. If you have a medical condition or are pregnant, please ask your doctor first.
      </p>
    </div>
  );
}
