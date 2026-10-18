import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import PageShell from "@/components/ui/PageShell";

export const metadata: Metadata = pageMeta({
  title: "Privacy Policy",
  description:
    "How Teambull Fuel House handles your information.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <PageShell first="Privacy" second="Policy">
      <p>
        We do not create accounts or store payment details on this website. Your
        cart is saved only in your own browser.
      </p>
      <p>
        When you order, your cart is sent to us as a WhatsApp message. We use
        the name, phone number and address you share on WhatsApp only to confirm
        and deliver your order, and we do not sell your data.
      </p>
      <p className="text-sm text-muted">
        Sample wording. Please have it reviewed by a professional before launch.
      </p>
    </PageShell>
  );
}
