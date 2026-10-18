import { Suspense } from "react";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import BarbellLoader from "@/components/fx/BarbellLoader";
import PageShell from "@/components/ui/PageShell";
import SupplementFinder from "@/components/tools/SupplementFinder";
import { getProducts } from "@/lib/catalog";

export const metadata: Metadata = pageMeta({
  title: "Find Your Supplement",
  description:
    "Answer 2 quick questions and we will suggest supplements for your goal and budget.",
  path: "/find-supplement",
});

async function Finder() {
  const products = await getProducts();
  return <SupplementFinder products={products} />;
}

export default function FindSupplementPage() {
  return (
    <PageShell first="Find your" second="Supplement">
      <p>Answer 2 quick questions and we will suggest what fits you.</p>
      <div className="pt-4 text-foreground">
        <Suspense fallback={<BarbellLoader />}>
          <Finder />
        </Suspense>
      </div>
    </PageShell>
  );
}
