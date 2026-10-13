import { Suspense } from "react";
import type { Metadata } from "next";
import PageShell from "@/components/ui/PageShell";
import AuthForm from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Sign up",
  robots: { index: false },
};

export default function SignupPage() {
  return (
    <PageShell first="Create your" second="account">
      <p>One account for your orders. Takes less than a minute.</p>
      <div className="pt-2">
        <Suspense fallback={<p>Loading…</p>}>
          <AuthForm mode="signup" />
        </Suspense>
      </div>
    </PageShell>
  );
}
