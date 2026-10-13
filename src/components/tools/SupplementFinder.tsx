"use client";

import { useState } from "react";
import type { Product } from "@/types";
import { SITE, type Category } from "@/config/site";
import { isInStock, startingPrice } from "@/lib/products";
import { buildChatUrl } from "@/lib/whatsapp";
import ProductCard from "@/components/product/ProductCard";

type Goal = {
  id: string;
  title: string;
  text: string;
  categories: Category[]; // best categories for this goal, in order
};

const GOALS: Goal[] = [
  {
    id: "muscle",
    title: "Build muscle",
    text: "Gain size and strength",
    categories: ["Whey Protein", "Creatine", "Mass Gainer"],
  },
  {
    id: "fatloss",
    title: "Lose fat",
    text: "Stay lean while you train",
    categories: ["Whey Protein", "BCAA & EAA", "Vitamins"],
  },
  {
    id: "energy",
    title: "Energy & performance",
    text: "Focus and power for workouts",
    categories: ["Pre-Workout", "Creatine"],
  },
  {
    id: "recovery",
    title: "Recovery",
    text: "Bounce back faster after training",
    categories: ["BCAA & EAA", "Whey Protein"],
  },
  {
    id: "health",
    title: "General health",
    text: "Everyday nutrition support",
    categories: ["Vitamins", "Whey Protein"],
  },
];

const BUDGETS = [
  { id: "low", title: "Under ₹1,000", max: 1000 },
  { id: "mid", title: "Under ₹2,500", max: 2500 },
  { id: "any", title: "Any budget", max: Infinity },
];

export default function SupplementFinder({ products }: { products: Product[] }) {
  const [goalId, setGoalId] = useState<string | null>(null);
  const [budgetId, setBudgetId] = useState<string | null>(null);

  const goal = GOALS.find((g) => g.id === goalId);
  const budget = BUDGETS.find((b) => b.id === budgetId);

  const reset = () => {
    setGoalId(null);
    setBudgetId(null);
  };

  const option =
    "rounded-xl border border-line bg-surface p-5 text-left transition hover:border-accent hover:text-accent";

  // Step 1: goal
  if (!goal) {
    return (
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">
          Step 1 of 2
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold uppercase">
          What is your main goal?
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {GOALS.map((g) => (
            <button key={g.id} onClick={() => setGoalId(g.id)} className={option}>
              <span className="block text-lg font-semibold">{g.title}</span>
              <span className="mt-1 block text-sm font-normal text-muted">
                {g.text}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Step 2: budget
  if (!budget) {
    return (
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">
          Step 2 of 2
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold uppercase">
          What is your budget?
        </h2>
        <p className="mt-1 text-sm text-muted">Goal: {goal.title}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {BUDGETS.map((b) => (
            <button key={b.id} onClick={() => setBudgetId(b.id)} className={option}>
              <span className="block text-lg font-semibold">{b.title}</span>
            </button>
          ))}
        </div>
        <button
          onClick={reset}
          className="mt-6 text-sm text-muted hover:text-accent"
        >
          ← Change goal
        </button>
      </div>
    );
  }

  // Result
  const picks = products.filter(
    (p) =>
      goal.categories.includes(p.category) &&
      isInStock(p) &&
      startingPrice(p) <= budget.max
  )
    .sort(
      (a, b) =>
        goal.categories.indexOf(a.category) -
          goal.categories.indexOf(b.category) ||
        startingPrice(a) - startingPrice(b)
    )
    .slice(0, 4);

  const askUrl = buildChatUrl(
    `Hi ${SITE.name}! My goal is "${goal.title}" and my budget is "${budget.title}". Which supplements do you suggest?`
  );

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wide text-accent">
        Your picks
      </p>
      <h2 className="mt-1 font-display text-2xl font-bold uppercase">
        For {goal.title.toLowerCase()} · {budget.title.toLowerCase()}
      </h2>

      {picks.length === 0 ? (
        <div className="mt-6 rounded-xl border border-line bg-surface p-8 text-center">
          <p className="font-semibold">No exact match for this budget</p>
          <p className="mt-1 text-sm text-muted">
            Try a bigger budget, or ask us on WhatsApp and we will suggest
            something.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {picks.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <a
          href={askUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-green-500 px-6 py-3 text-sm font-semibold text-white hover:bg-green-600"
        >
          Ask us on WhatsApp
        </a>
        <button
          onClick={reset}
          className="text-sm font-medium text-muted hover:text-accent"
        >
          Start again
        </button>
      </div>

      <p className="mt-6 text-xs text-muted">
        These are general suggestions, not medical advice. If you have a health
        condition, check with your doctor before taking supplements.
      </p>
    </div>
  );
}
