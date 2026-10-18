import { Suspense } from "react";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import BarbellLoader from "@/components/fx/BarbellLoader";
import PageShell from "@/components/ui/PageShell";
import BundleBuilder from "@/components/bundles/BundleBuilder";
import { getProducts } from "@/lib/catalog";

export const metadata: Metadata = pageMeta({
  title: "Combo Packs",
  description:
    "Gym supplement combo packs: Muscle Starter Pack, Fat Loss Kit, Mass Gain Pack and more. Pick your flavours and add the whole pack in one tap.",
  path: "/bundles",
});

async function Packs() {
  const products = await getProducts();
  return <BundleBuilder products={products} />;
}

export default function BundlesPage() {
  return (
    <PageShell first="Combo" second="Packs" narrow={false}>
      <p className="max-w-2xl">Pick a pack for your goal, choose your flavours and add everything in one tap.</p>
      <div className="pt-4 text-foreground">
        <Suspense fallback={<BarbellLoader />}>
          <Packs />
        </Suspense>
      </div>
    </PageShell>
  );
}
