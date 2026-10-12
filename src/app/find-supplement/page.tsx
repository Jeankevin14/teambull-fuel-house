import type { Metadata } from "next";
import PageShell from "@/components/ui/PageShell";
import SupplementFinder from "@/components/tools/SupplementFinder";

export const metadata: Metadata = {
  title: "Find Your Supplement",
  description: "Answer 2 quick questions and we will suggest supplements for your goal and budget.",
};

export default function FindSupplementPage() {
  return (
    <PageShell first="Find your" second="Supplement">
      <p>Answer 2 quick questions and we will suggest what fits you.</p>
      <div className="pt-4 text-foreground">
        <SupplementFinder />
      </div>
    </PageShell>
  );
}
