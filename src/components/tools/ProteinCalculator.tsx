"use client";

import Link from "next/link";
import { useState } from "react";

const GOALS = [
  { id: "maintain", title: "Stay healthy", min: 1.2, max: 1.6 },
  { id: "muscle", title: "Build muscle", min: 1.6, max: 2.2 },
  { id: "fatloss", title: "Lose fat", min: 1.6, max: 2.2 },
];

const WHEY_SCOOP_PROTEIN = 24; // grams of protein in one scoop (approx.)

export default function ProteinCalculator() {
  const [weight, setWeight] = useState("");
  const [goalId, setGoalId] = useState("muscle");

  const goal = GOALS.find((g) => g.id === goalId) ?? GOALS[1];
  const kg = Number(weight);
  const valid = kg >= 30 && kg <= 200;

  const low = Math.round(kg * goal.min);
  const high = Math.round(kg * goal.max);
  const perMeal = Math.round(((low + high) / 2) / 4);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold">Your weight (kg)</span>
          <input
            type="number"
            inputMode="decimal"
            min={30}
            max={200}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="e.g. 70"
            className="mt-2 w-full rounded-full border border-line bg-white px-5 py-3 outline-none focus:border-accent"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold">Your goal</span>
          <select
            value={goalId}
            onChange={(e) => setGoalId(e.target.value)}
            className="mt-2 w-full rounded-full border border-line bg-white px-5 py-3 outline-none focus:border-accent"
          >
            {GOALS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      {weight !== "" && !valid && (
        <p className="mt-4 text-sm text-accent">
          Please enter a weight between 30 and 200 kg.
        </p>
      )}

      {valid && (
        <div className="mt-8 rounded-xl border border-line bg-red-50 p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">
            Your daily protein
          </p>
          <p className="mt-1 font-display text-5xl font-bold">
            {low}–{high} <span className="text-2xl">g</span>
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li>About {perMeal} g per meal if you eat 4 meals a day.</li>
            <li>
              One scoop of whey gives about {WHEY_SCOOP_PROTEIN} g, so 1–2
              scoops can cover part of your target. The rest comes from food
              like eggs, dal, paneer, chicken and fish.
            </li>
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
        This is a general estimate for healthy adults, not medical advice. If
        you have kidney problems or any medical condition, or you are pregnant,
        ask your doctor or dietitian first.
      </p>
    </div>
  );
}
