"use client";

import Link from "next/link";
import { useState } from "react";
import { ACTIVITY, GOALS, proteinFor, type Activity, type Goal } from "@/lib/bmi";

const WHEY_SCOOP_PROTEIN = 24; // grams of protein in one scoop (approx.)

const field =
  "mt-2 w-full rounded-full border border-line bg-white px-5 py-3 outline-none focus:border-accent";

export default function ProteinCalculator() {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [goal, setGoal] = useState<Goal>("muscle");
  const [activity, setActivity] = useState<Activity>("moderate");

  const kg = Number(weight);
  const cm = Number(height);
  const kgOk = weight !== "" && kg >= 30 && kg <= 250;
  const cmOk = height !== "" && cm >= 120 && cm <= 230;
  const valid = kgOk && cmOk;
  const r = valid ? proteinFor(kg, cm, goal, activity) : null;
  const mid = r ? (r.min + r.max) / 2 : 0;
  const perMeal = Math.round(mid / 4);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold">Weight (kg)</span>
          <input
            type="number"
            inputMode="decimal"
            min={30}
            max={250}
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="e.g. 70"
            className={field}
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Height (cm)</span>
          <input
            type="number"
            inputMode="numeric"
            min={120}
            max={230}
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="e.g. 170"
            className={field}
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Goal</span>
          <select value={goal} onChange={(e) => setGoal(e.target.value as Goal)} className={field}>
            {GOALS.map((g) => (
              <option key={g.id} value={g.id}>{g.label}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Activity</span>
          <select value={activity} onChange={(e) => setActivity(e.target.value as Activity)} className={field}>
            {ACTIVITY.map((a) => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </select>
        </label>
      </div>

      {((weight !== "" && !kgOk) || (height !== "" && !cmOk)) && (
        <p className="mt-4 text-sm text-accent">Enter weight between 30 and 250 kg and height between 120 and 230 cm.</p>
      )}

      {r && (
        <div className="mt-8 rounded-xl border border-line bg-red-50 p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">Your daily protein</p>
          <p className="mt-1 font-display text-5xl font-bold">
            {r.min}–{r.max} <span className="text-2xl">g</span>
          </p>
          <p className="mt-1 text-sm text-muted">
            {r.perKg[0]}–{r.perKg[1]} g per kg{r.adjusted ? ` of ${r.baseKg} kg` : ""}
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li>About {perMeal} g per meal over 4 meals.</li>
            <li>
              One whey scoop gives about {WHEY_SCOOP_PROTEIN} g. Cover the rest with eggs, dal, paneer, chicken or fish.
            </li>
            {r.adjusted && (
              <li>Your weight is above the healthy range, so protein is counted on {r.baseKg} kg. Extra body fat does not need extra protein.</li>
            )}
          </ul>
          <Link
            href="/products?category=Whey%20Protein"
            className="mt-5 inline-block rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white"
          >
            See whey protein
          </Link>
        </div>
      )}

      <p className="mt-6 text-xs text-muted">
        General estimate for healthy adults, not medical advice. If you have kidney problems or any medical condition, or
        you are pregnant, ask your doctor or dietitian first.
      </p>
    </div>
  );
}
