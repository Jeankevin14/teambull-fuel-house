import { Suspense } from "react";
import type { Metadata } from "next";
import PageShell from "@/components/ui/PageShell";
import AuthForm from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Log in",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <PageShell first="Log" second="in">
      <p>Log in to see your orders and check out on WhatsApp.</p>
      <div className="pt-2">
        <Suspense fallback={<p>Loading…</p>}>
          <AuthForm mode="login" />
        </Suspense>
      </div>
    </PageShell>
  );
}
