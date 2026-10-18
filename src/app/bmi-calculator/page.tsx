import { Suspense } from "react";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import BarbellLoader from "@/components/fx/BarbellLoader";
import PageShell from "@/components/ui/PageShell";
import BmiCalculator from "@/components/tools/BmiCalculator";
import { getProducts } from "@/lib/catalog";

export const metadata: Metadata = pageMeta({
  title: "BMI Calculator",
  description:
    "Free BMI calculator with daily calories and protein for your goal. Get a free fitness consultation from Team Bull.",
  path: "/bmi-calculator",
});

const PICK_CATEGORIES = new Set([
  "Whey Protein",
  "Creatine",
  "Pre-Workout",
  "Mass Gainer",
  "BCAA & EAA",
  "Vitamins",
]);

async function Calculator() {
  const all = await getProducts();
  const products = all.filter((p) => PICK_CATEGORIES.has(p.category));
  return <BmiCalculator products={products} />;
}

export default function BmiCalculatorPage() {
  return (
    <PageShell first="BMI" second="Calculator" narrow={false}>
      <p className="max-w-2xl">Four quick steps. Get your BMI, daily calories and a free consultation.</p>
      <div className="pt-4 text-foreground">
        <Suspense fallback={<BarbellLoader />}>
          <Calculator />
        </Suspense>
      </div>
    </PageShell>
  );
}
