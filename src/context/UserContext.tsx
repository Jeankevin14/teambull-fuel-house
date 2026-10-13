"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Me } from "@/types";

type UserState = {
  user: Me | null;
  ready: boolean;
  refresh: () => Promise<void>;
};

const UserContext = createContext<UserState | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Me | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      const data = (await res.json()) as { user: Me | null };
      setUser(data.user);
    } catch {
      setUser(null);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  const value = useMemo(() => ({ user, ready, refresh }), [user, ready, refresh]);
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside <UserProvider>");
  return ctx;
}
