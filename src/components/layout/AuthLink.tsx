"use client";

import Link from "next/link";
import { useUser } from "@/context/UserContext";

/** Header: "Login" when logged out, "Account" (and "Admin" for the owner) when logged in. */
export default function AuthLink() {
  const { user, ready } = useUser();

  if (!ready) {
    return <span className="inline-block w-12" aria-hidden />;
  }

  if (!user) {
    return (
      <Link href="/login" className="hover:text-accent">
        Login
      </Link>
    );
  }

  return (
    <>
      {user.role === "admin" && (
        <Link href="/admin" className="hover:text-accent">
          Admin
        </Link>
      )}
      <Link href="/account" className="hover:text-accent">
        Account
      </Link>
    </>
  );
}
