// BMI maths used by the BMI calculator.
// Categories use the WHO Asia-Pacific cut-offs (23 = overweight, 25 = obese),
// which suit Indian adults better than the global 25 / 30 cut-offs.

export type Gender = "male" | "female" | "other";
export type Activity = "sedentary" | "light" | "moderate" | "active";
export type Goal = "lose" | "muscle" | "maintain" | "gain";
export type BmiLevel = "under" | "normal" | "over" | "obese" | "severe";

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

export function bmiOf(kg: number, cm: number) {
  const m = cm / 100;
  return kg / (m * m);
}

export function levelOf(bmi: number): BmiLevel {
  if (bmi < 18.5) return "under";
  if (bmi < 23) return "normal";
  if (bmi < 25) return "over";
  if (bmi < 30) return "obese";
  return "severe";
}

/** healthy weight range (BMI 18.5 to 22.9) for a height, in kg */
export function healthyRangeKg(cm: number) {
  const m2 = (cm / 100) ** 2;
  return { min: Math.ceil(18.5 * m2), max: Math.floor(22.9 * m2) };
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
  if (goal === "lose") target = Math.max(maintenance - 500, bmr, gender === "female" ? 1200 : 1500);
  if (goal === "muscle") target = maintenance + 250;
  if (goal === "gain") target = maintenance + 400;
  return { maintenance: round10(maintenance), target: round10(target) };
}

/** daily protein range in grams for a goal (based on a sensible body weight) */
export function proteinFor(kg: number, goal: Goal) {
  const base = Math.min(kg, 100);
  const [lo, hi] = goal === "maintain" ? [1.2, 1.6] : [1.6, 2.2];
  return { min: Math.round(base * lo), max: Math.round(base * hi) };
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
