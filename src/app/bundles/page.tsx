import { Suspense } from "react";
import type { Metadata } from "next";
import BarbellLoader from "@/components/fx/BarbellLoader";
import PageShell from "@/components/ui/PageShell";
import BundleBuilder from "@/components/bundles/BundleBuilder";
import { getProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Combo Packs",
  description:
    "Save on gym supplement combos: Muscle Starter Pack, Fat Loss Kit, Mass Gain Pack and more. Pick your flavours and add the whole pack in one tap.",
  alternates: { canonical: "/bundles" },
};

async function Packs() {
  const products = await getProducts();
  return <BundleBuilder products={products} />;
}

export default function BundlesPage() {
  return (
    <PageShell first="Combo" second="Packs" narrow={false}>
      <p className="max-w-2xl">Pick a pack, choose your flavours and save more than buying one by one.</p>
      <div className="pt-4 text-foreground">
        <Suspense fallback={<BarbellLoader />}>
          <Packs />
        </Suspense>
      </div>
    </PageShell>
  );
}
