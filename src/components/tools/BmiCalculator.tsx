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

const LEVELS: Record<BmiLevel, { label: string; color: string; headline: string; text: string }> = {
  under: { label: "Underweight", color: "#3b82f6", headline: "Time to fuel up", text: "You are below the healthy range. Eat in a surplus, get enough protein and lift to gain weight the healthy way." },
  normal: { label: "Healthy", color: "#16a34a", headline: "Right in the zone", text: "Your weight is in the healthy range. Now build strength and stay consistent." },
  over: { label: "Overweight", color: "#f59e0b", headline: "Slightly above the range", text: "Small changes in food and training can bring this down. A clear plan makes it easier." },
  obese: { label: "Obese", color: "#ea580c", headline: "Let's build a plan", text: "Steady training and the right nutrition work. Our coaches can guide you step by step." },
  severe: { label: "Obese (high)", color: "#dc2626", headline: "Start with a plan", text: "Your BMI is high. Please also get a check-up with your doctor. We can help with training and food habits at a safe pace." },
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

const W_MIN = 30;
const W_MAX = 250;
const DIAL_C = 130;
const DIAL_R = 100;
const dialAngle = (kg: number) => -135 + ((Math.min(W_MAX, Math.max(W_MIN, kg)) - W_MIN) / (W_MAX - W_MIN)) * 270;
const dialPoint = (angle: number, r: number) => {
  const a = (angle * Math.PI) / 180;
  return [DIAL_C + r * Math.sin(a), DIAL_C - r * Math.cos(a)];
};
function dialArc(a1: number, a2: number, r = DIAL_R) {
  const [x1, y1] = dialPoint(a1, r);
  const [x2, y2] = dialPoint(a2, r);
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${a2 - a1 > 180 ? 1 : 0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

/** A weighing-scale dial. The needle moves with your weight and the green zone is the healthy weight for your height. */
function ScaleDial({ kg, cm, bmi, color, label }: { kg: number; cm: number; bmi: number; color: string; label: string }) {
  const m2 = (cm / 100) ** 2;
  const gLo = dialAngle(18.5 * m2);
  const gHi = dialAngle(22.9 * m2);
  const ticks: number[] = [];
  for (let w = 30; w <= 250; w += 10) ticks.push(w);
  return (
    <svg viewBox="0 0 260 230" className="mx-auto w-full max-w-[15rem] sm:max-w-xs" role="img" aria-label={`Scale showing ${kg} kilograms`}>
      <path d={dialArc(-135, 135)} stroke="#e5e7eb" strokeWidth="18" fill="none" strokeLinecap="round" />
      <path d={dialArc(gLo, gHi)} stroke="#16a34a" strokeWidth="18" fill="none" />
      {ticks.map((w) => {
        const major = w % 50 === 0;
        const ang = dialAngle(w);
        const [x1, y1] = dialPoint(ang, DIAL_R - 14);
        const [x2, y2] = dialPoint(ang, DIAL_R - (major ? 24 : 19));
        return <line key={w} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#6b7280" strokeWidth={major ? 2 : 1} />;
      })}
      {[50, 100, 150, 200, 250].map((w) => {
        const [x, y] = dialPoint(dialAngle(w), DIAL_R - 38);
        return (
          <text key={w} x={x} y={y + 3} fontSize="10" textAnchor="middle" fill="#5f6368">
            {w}
          </text>
        );
      })}
      <g className="bmi-needle" style={{ transform: `rotate(${dialAngle(kg)}deg)`, transformOrigin: `${DIAL_C}px ${DIAL_C}px` }}>
        <polygon points={`${DIAL_C - 5},${DIAL_C} ${DIAL_C + 5},${DIAL_C} ${DIAL_C},${DIAL_C - 84}`} fill="#1a1a1a" />
      </g>
      <circle cx={DIAL_C} cy={DIAL_C} r="11" fill="#1a1a1a" />
      <circle cx={DIAL_C} cy={DIAL_C} r="4" fill={color} />
      <text x={DIAL_C} y="176" fontSize="12" textAnchor="middle" fill="#5f6368">BMI</text>
      <text x={DIAL_C} y="204" fontSize="28" fontWeight="700" textAnchor="middle" fill={color} style={{ transition: "fill .3s" }}>
        {bmi.toFixed(1)}
      </text>
      <text x={DIAL_C} y="222" fontSize="11" fontWeight="600" textAnchor="middle" fill={color}>{label}</text>
    </svg>
  );
}

/** Big number you can type into, with - and + buttons. */
function NumberStepper({
  value,
  onChange,
  min,
  max,
  unit,
  label,
  decimals = false,
  big = false,
}: {
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  unit: string;
  label: string;
  decimals?: boolean;
  big?: boolean;
}) {
  const [text, setText] = useState<string | null>(null);
  const clamp = (n: number) => {
    const c = Math.min(max, Math.max(min, n));
    return decimals ? Math.round(c * 10) / 10 : Math.round(c);
  };
  const step = (d: number) => {
    setText(null);
    onChange(clamp(value + d));
  };
  const btn =
    "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line bg-white text-2xl font-bold transition hover:border-accent hover:text-accent active:scale-95";
  return (
    <div className="flex items-center justify-center gap-4 sm:gap-5">
      <button type="button" className={btn} onClick={() => step(-1)} aria-label={`Decrease ${label}`}>−</button>
      <label className="flex items-baseline justify-center gap-1 rounded-2xl border-2 border-transparent px-2 transition focus-within:border-accent focus-within:bg-white">
        <input
          type="text"
          inputMode={decimals ? "decimal" : "numeric"}
          value={text ?? String(value)}
          aria-label={`${label} in ${unit}`}
          onFocus={(e) => e.currentTarget.select()}
          onChange={(e) => {
            const v = e.target.value.replace(",", ".");
            if (!(decimals ? /^\d{0,3}\.?\d{0,1}$/ : /^\d{0,3}$/).test(v)) return;
            setText(v);
            const n = Number(v);
            if (v !== "" && v !== "." && n >= min && n <= max) onChange(n);
          }}
          onBlur={() => {
            const n = Number(text);
            if (text !== null && text !== "" && text !== ".") onChange(clamp(n));
            setText(null);
          }}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          style={{ outline: "none", boxShadow: "none" }}
          className={`bg-transparent text-center font-display font-bold tabular-nums outline-none ${
            big ? "w-[3.4ch] text-7xl" : decimals ? "w-[5.2ch] text-6xl" : "w-[2.6ch] text-6xl"
          }`}
          />
        <span className={`text-muted ${big ? "text-2xl" : "text-xl"}`}>{unit}</span>
      </label>
      <button type="button" className={btn} onClick={() => step(1)} aria-label={`Increase ${label}`}>+</button>
    </div>
  );
}

const chip = (on: boolean) =>
  `rounded-full border px-4 py-2 text-sm font-semibold transition ${
    on ? "border-accent bg-accent text-white" : "border-line bg-white hover:border-accent hover:text-accent"
  }`;

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
  const protein = proteinFor(kg, cm, goal, activity);
  const suggested = suggestedGoal(level);
  const wantsHelp = level !== "normal";
  const goalLabel = GOALS.find((x) => x.id === goal)?.label ?? "";

  const canNext = step !== 0 || gender !== null;

  function reveal(e: React.MouseEvent<HTMLButtonElement>) {
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
                  <NumberStepper value={age} onChange={setAge} min={18} max={80} unit="yrs" label="Age" />
                  <p className="mt-2 text-center text-xs text-muted">Type your age or use + and −</p>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-center font-display text-3xl font-bold uppercase">How tall are you?</h2>
                <NumberStepper value={cm} onChange={setCm} min={120} max={230} unit="cm" label="Height" big />
                <p className="-mt-3 text-center text-muted">{toFeet(cm)}</p>
                <div className="mx-auto max-w-xl">
                  <input
                    type="range"
                    min={120}
                    max={230}
                    value={cm}
                    onChange={(e) => setCm(Number(e.target.value))}
                    aria-label="Height in centimetres"
                    className="h-3 w-full cursor-pointer accent-[#dc2626]"
                  />
                  <div className="mt-1 flex justify-between text-xs text-muted">
                    {[120, 140, 160, 180, 200, 230].map((t) => <span key={t}>{t}</span>)}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-center font-display text-3xl font-bold uppercase">How much do you weigh?</h2>
                <ScaleDial kg={kg} cm={cm} bmi={bmi} color={info.color} label={info.label} />
                <NumberStepper value={kg} onChange={setKg} min={W_MIN} max={W_MAX} unit="kg" label="Weight" decimals />
                <div className="mx-auto max-w-xl">
                  <input
                    type="range"
                    min={W_MIN}
                    max={W_MAX}
                    step={0.5}
                    value={kg}
                    onChange={(e) => setKg(Number(e.target.value))}
                    aria-label="Weight in kilograms"
                    className="h-3 w-full cursor-pointer accent-[#dc2626]"
                  />
                </div>
                <p className="text-center text-sm text-muted">
                  <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-[#16a34a] align-middle" />
                  Healthy zone for {cm} cm: <strong className="text-foreground">{range.min}–{range.max} kg</strong>
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
                  className="btn-shine rounded-full bg-accent px-9 py-3 font-bold text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {canNext ? "Next" : "Pick one to continue"}
                </button>
              ) : (
                <button type="button" onClick={reveal} className="btn-shine rounded-full bg-accent px-9 py-3 font-bold text-white transition hover:bg-accent-dark">
                  Show my BMI
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bmi-step space-y-6">
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
                <p className="mt-1 text-xs text-muted">
                  {protein.perKg[0]}–{protein.perKg[1]} g per kg
                  {protein.adjusted ? ` of ${protein.baseKg} kg` : ""} ·{" "}
                  <Link href="/protein-calculator" className="underline hover:text-accent">Protein calculator</Link>
                </p>
              </div>
            </div>
          </div>

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
