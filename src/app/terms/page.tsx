import type { Metadata } from "next";
import PageShell from "@/components/ui/PageShell";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <PageShell first="Terms &" second="Conditions">
      <p>
        Prices shown on this website are for reference. The final price,
        delivery charges and payment method are confirmed with you on WhatsApp
        before your order is accepted.
      </p>
      <p>
        An order is confirmed only after we reply on WhatsApp and agree the
        details with you. Products are subject to availability.
      </p>
      <p>
        Supplements are not medicines and are not intended to diagnose, treat or
        cure any disease. Consult a doctor before use if you have a medical
        condition.
      </p>
      <p className="text-sm text-muted">
        Sample wording. Please have it reviewed by a professional before launch.
      </p>
    </PageShell>
  );
}
