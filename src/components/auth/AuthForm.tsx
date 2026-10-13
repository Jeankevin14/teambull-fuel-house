"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState, useEffect } from "react";
import { loginAction, signupAction } from "@/app/actions/auth";
import { useUser } from "@/context/UserContext";
import type { FormState } from "@/types/forms";

const input =
  "mt-1 w-full rounded-lg border border-line bg-white px-3 py-3 text-foreground outline-none focus:border-accent";

function safeNext(v: string | null) {
  if (!v || !v.startsWith("/") || v.startsWith("//") || v.includes("\\")) return "/account";
  return v;
}

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const { refresh } = useUser();

  const [state, action, pending] = useActionState<FormState, FormData>(
    mode === "login" ? loginAction : signupAction,
    { ok: false }
  );

  useEffect(() => {
    if (!state.ok) return;
    void refresh().then(() => {
      router.replace(next);
      router.refresh();
    });
  }, [state.ok, refresh, router, next]);

  const isSignup = mode === "signup";
  const other = `${isSignup ? "/login" : "/signup"}?next=${encodeURIComponent(next)}`;

  return (
    <form action={action} className="space-y-4 rounded-xl border border-line bg-surface p-6">
      {isSignup && (
        <>
          <label className="block text-sm font-medium text-foreground">
            Full name
            <input name="name" defaultValue={state.fields?.name} required minLength={2} maxLength={60} autoComplete="name" className={input} />
          </label>
          <label className="block text-sm font-medium text-foreground">
            Mobile number
            <input name="phone" defaultValue={state.fields?.phone} required inputMode="tel" autoComplete="tel" placeholder="10-digit number" className={input} />
          </label>
        </>
      )}
      <label className="block text-sm font-medium text-foreground">
        Email
        <input name="email" type="email" defaultValue={state.fields?.email} required autoComplete="email" className={input} />
      </label>
      <label className="block text-sm font-medium text-foreground">
        Password
        <input
          name="password"
          type="password"
          required
          minLength={isSignup ? 8 : 1}
          maxLength={72}
          autoComplete={isSignup ? "new-password" : "current-password"}
          className={input}
        />
        {isSignup && <span className="mt-1 block text-xs text-muted">At least 8 characters.</span>}
      </label>

      {state.error && (
        <p role="alert" className="rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent-dark">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || state.ok}
        className="w-full rounded-full bg-accent py-3.5 font-semibold text-white hover:opacity-90 disabled:opacity-60"
      >
        {pending || state.ok ? "Please wait…" : isSignup ? "Create account" : "Log in"}
      </button>

      <p className="text-center text-sm text-muted">
        {isSignup ? "Already have an account?" : "New here?"}{" "}
        <Link href={other} className="font-semibold text-accent hover:underline">
          {isSignup ? "Log in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
