"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/app/actions/auth";
import { useUser } from "@/context/UserContext";
import { useEffect } from "react";
import type { FormState } from "@/types/forms";

const input =
  "mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-foreground outline-none focus:border-accent";

export default function ProfileForm({ name, phone }: { name: string; phone: string }) {
  const { refresh } = useUser();
  const [state, action, pending] = useActionState<FormState, FormData>(updateProfileAction, { ok: false });

  useEffect(() => {
    if (state.ok) void refresh();
  }, [state.ok, refresh]);

  return (
    <form action={action} className="mt-4 grid gap-3 sm:grid-cols-2">
      <label className="block text-sm font-medium text-foreground">
        Name
        <input name="name" defaultValue={name} required minLength={2} maxLength={60} className={input} />
      </label>
      <label className="block text-sm font-medium text-foreground">
        Mobile number
        <input name="phone" defaultValue={phone} required inputMode="tel" className={input} />
      </label>
      <div className="sm:col-span-2 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        {state.error && <span className="text-sm text-accent-dark">{state.error}</span>}
        {state.ok && state.message && <span className="text-sm text-green-600">{state.message}</span>}
      </div>
    </form>
  );
}
