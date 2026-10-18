import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import PageShell from "@/components/ui/PageShell";

export const metadata: Metadata = pageMeta({
  title: "Refund & Return Policy",
  description:
    "How refunds, returns and replacements work at Teambull Fuel House.",
  path: "/refund-policy",
});

export default function RefundPolicyPage() {
  return (
    <PageShell first="Refund &" second="Returns">
      <p>
        If you receive a damaged, wrong or expired product, message us on
        WhatsApp within 48 hours of delivery with photos of the product and
        packaging.
      </p>
      <p>
        For opened or used supplements we cannot accept returns, for hygiene and
        safety reasons.
      </p>
      <p>
        Add your own return window, refund method and timeline here. (Edit this
        text in <code>src/app/refund-policy/page.tsx</code>.)
      </p>
      <p className="text-sm text-muted">
        Sample wording. Please have it reviewed by a professional before launch.
      </p>
    </PageShell>
  );
}
