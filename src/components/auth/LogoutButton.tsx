"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { logoutAction } from "@/app/actions/auth";
import { useUser } from "@/context/UserContext";

export default function LogoutButton() {
  const router = useRouter();
  const { refresh } = useUser();
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await logoutAction();
          await refresh();
          router.replace("/");
          router.refresh();
        })
      }
      className="rounded-full border border-line px-5 py-2 text-sm font-semibold text-foreground hover:border-accent hover:text-accent disabled:opacity-60"
    >
      {pending ? "Logging out…" : "Log out"}
    </button>
  );
}
