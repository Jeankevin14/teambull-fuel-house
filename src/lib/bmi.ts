// BMI maths used by the BMI calculator.
// BMI = weight (kg) / height (m)^2, for adults 18+.
// Default categories are the standard WHO adult cut-offs (underweight < 18.5, normal 18.5-24.9,
// overweight 25-29.9, obese 30+). An Indian / Asian view (WHO Asia-Pacific and Indian consensus:
// overweight from 23, obese from 25) is available because risk starts at a lower BMI for South Asians.

export type Gender = "male" | "female" | "other";
export type Activity = "sedentary" | "light" | "moderate" | "active";
export type Goal = "lose" | "muscle" | "maintain" | "gain";
export type BmiLevel = "under" | "normal" | "over" | "obese";
export type Scale = "who" | "asia";

export const ACTIVITY: { id: Activity; label: string; factor: number }[] = [
  { id: "sedentary", label: "Little or no exercise", factor: 1.2 },
  { id: "light", label: "Train 1–3 days a week", factor: 1.375 },
  { id: "moderate", label: "Train 4–5 days a week", factor: 1.55 },
  { id: "active", label: "Train 6–7 days / physical job", factor: 1.725 },
];

export const GOALS: { id: Goal; label: string }[] = [
  { id: "lose", label: "Lose fat" },
  { id: "muscle", label: "Build muscle" },
  { id: "maintain", label: "Stay fit" },
  { id: "gain", label: "Gain healthy weight" },
];

export const LIMITS = {
  age: [18, 80],
  heightCm: [120, 230],
  weightKg: [30, 250],
} as const;

/** BMI rounded to one decimal, so the number shown and the category always agree */
export function bmiOf(kg: number, cm: number) {
  const m = cm / 100;
  return Math.round((kg / (m * m)) * 10) / 10;
}

export const SCALES: Record<Scale, { label: string; short: string; over: number; obese: number; normalTop: number; note: string }> = {
  who: {
    label: "Standard (WHO)",
    short: "WHO standard",
    over: 25,
    obese: 30,
    normalTop: 24.9,
    note: "Standard WHO adult classification, used worldwide: underweight below 18.5, normal 18.5 to 24.9, overweight 25 to 29.9, obese 30 and above.",
  },
  asia: {
    label: "Indian / Asian",
    short: "Asian cut-offs",
    over: 23,
    obese: 25,
    normalTop: 22.9,
    note: "WHO Asia-Pacific and Indian guidelines. South Asians tend to carry more body fat and have higher health risk at the same BMI, so overweight starts at 23 and obesity at 25.",
  },
};

/** category of a (one-decimal) BMI on the chosen scale */
export function levelOf(bmi: number, scale: Scale = "who"): BmiLevel {
  const s = SCALES[scale];
  if (bmi < 18.5) return "under";
  if (bmi < s.over) return "normal";
  if (bmi < s.obese) return "over";
  return "obese";
}

/** finer WHO grade inside a category */
export function gradeOf(bmi: number, scale: Scale = "who"): string {
  if (bmi < 16) return "Severe thinness";
  if (bmi < 17) return "Moderate thinness";
  if (bmi < 18.5) return "Mild thinness";
  const l = levelOf(bmi, scale);
  if (l === "normal") return "Normal weight";
  if (l === "over") return scale === "who" ? "Overweight (pre-obese)" : "Overweight (at risk)";
  if (scale === "who") return bmi < 35 ? "Obese class I" : bmi < 40 ? "Obese class II" : "Obese class III";
  return bmi < 30 ? "Obese class I" : "Obese class II";
}

/** healthy weight range for a height, in kg (one decimal, so every weight inside it truly sits in the normal band) */
export function healthyRangeKg(cm: number, scale: Scale = "who") {
  const m2 = (cm / 100) ** 2;
  return {
    min: Math.ceil(18.5 * m2 * 10) / 10,
    max: Math.floor(SCALES[scale].normalTop * m2 * 10) / 10,
  };
}

/** Mifflin-St Jeor resting calories (kcal per day) */
export function bmrOf(kg: number, cm: number, age: number, gender: Gender) {
  const base = 10 * kg + 6.25 * cm - 5 * age;
  if (gender === "male") return base + 5;
  if (gender === "female") return base - 161;
  return base - 78; // halfway between the two
}

const round10 = (n: number) => Math.round(n / 10) * 10;

export function caloriesFor(
  kg: number,
  cm: number,
  age: number,
  gender: Gender,
  activity: Activity,
  goal: Goal,
) {
  const bmr = bmrOf(kg, cm, age, gender);
  const factor = ACTIVITY.find((a) => a.id === activity)?.factor ?? 1.2;
  const maintenance = bmr * factor;
  let target = maintenance;
  // deficit of 500 kcal, but never more than 25% of maintenance, and never below a safe floor
  if (goal === "lose") {
    const deficit = Math.min(500, maintenance * 0.25);
    target = Math.max(maintenance - deficit, bmr, gender === "female" ? 1200 : 1500);
  }
  if (goal === "muscle") target = maintenance + 250;
  if (goal === "gain") target = maintenance + 400;
  return { maintenance: round10(maintenance), target: round10(target) };
}

/**
 * Weight that protein is worked out on. Up to the top of the healthy range (BMI 24.9) it is your own weight.
 * Above it, extra body fat does not need extra protein, so only a quarter of the excess is counted
 * (the usual "adjusted body weight" method).
 */
export function proteinBaseKg(kg: number, cm: number) {
  const top = SCALES.who.normalTop * (cm / 100) ** 2;
  return kg <= top ? kg : top + 0.25 * (kg - top);
}

/**
 * Grams of protein per kg of base weight per day, by goal and how much you train.
 * Based on the RDA (0.8 g/kg minimum), ISSN sports-nutrition guidance (1.4-2.0 g/kg for people who train),
 * resistance-training meta-analyses (about 1.6-2.2 g/kg for building muscle) and higher intakes
 * (up to about 2.4 g/kg) to protect muscle while cutting calories.
 */
const proteinTable: Record<Goal, Record<Activity, [number, number]>> = {
  maintain: { sedentary: [0.8, 1.2], light: [1.0, 1.4], moderate: [1.2, 1.6], active: [1.4, 1.8] },
  muscle: { sedentary: [1.2, 1.6], light: [1.4, 1.8], moderate: [1.6, 2.0], active: [1.6, 2.2] },
  gain: { sedentary: [1.2, 1.6], light: [1.4, 1.8], moderate: [1.6, 2.0], active: [1.6, 2.0] },
  lose: { sedentary: [1.2, 1.6], light: [1.6, 2.0], moderate: [1.8, 2.2], active: [1.8, 2.4] },
};

export function proteinPerKg(goal: Goal, activity: Activity, age = 30): [number, number] {
  let [lo, hi] = proteinTable[goal][activity];
  // adults 60+ need more protein per kg to keep muscle (at least 1.0 g/kg)
  if (age >= 60) {
    lo = Math.max(lo, 1.0);
    hi = Math.max(hi, Math.round((lo + 0.4) * 10) / 10);
  }
  return [lo, hi];
}

/** daily protein range in grams */
export function proteinFor(kg: number, cm: number, goal: Goal, activity: Activity, age = 30) {
  const base = proteinBaseKg(kg, cm);
  const [lo, hi] = proteinPerKg(goal, activity, age);
  const min = Math.round(base * lo);
  const max = Math.round(base * hi);
  return {
    min,
    max,
    mid: Math.round((min + max) / 2),
    perKg: [lo, hi] as [number, number],
    baseKg: Math.round(base * 10) / 10,
    adjusted: base < kg - 0.5,
  };
}

export function suggestedGoal(level: BmiLevel): Goal {
  if (level === "under") return "gain";
  if (level === "normal") return "maintain";
  return "lose";
}

/** gauge position: BMI 12 (far left) to 40 (far right), as an angle from -90 to +90 */
export function gaugeAngle(bmi: number) {
  const clamped = Math.min(40, Math.max(12, bmi));
  return -90 + ((clamped - 12) / 28) * 180;
}
