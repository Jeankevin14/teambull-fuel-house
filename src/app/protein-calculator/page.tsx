import type { Metadata } from "next";
import PageShell from "@/components/ui/PageShell";
import ProteinCalculator from "@/components/tools/ProteinCalculator";

export const metadata: Metadata = {
  title: "Protein Calculator",
  description: "Find out how much protein you need every day for your weight and goal.",
};

export default function ProteinCalculatorPage() {
  return (
    <PageShell first="Protein" second="Calculator">
      <p>Find out roughly how much protein you need every day.</p>
      <div className="pt-4 text-foreground">
        <ProteinCalculator />
      </div>
    </PageShell>
  );
}
