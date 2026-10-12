import type { Metadata } from "next";
import PageShell from "@/components/ui/PageShell";
import { SITE } from "@/config/site";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <PageShell first="About" second="Us">
      <p>
        {SITE.name} sells genuine gym supplements for people who train hard. We
        keep ordering simple: choose your products, send your order on WhatsApp,
        and we confirm everything with you personally.
      </p>
      <p>
        Write your own story here: who you are, why you started, and where your
        products come from. (Edit this text in <code>src/app/about/page.tsx</code>.)
      </p>
    </PageShell>
  );
}
