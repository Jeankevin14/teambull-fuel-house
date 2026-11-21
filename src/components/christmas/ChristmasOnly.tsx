"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { christmasIsOn } from "@/config/christmas";

/** The date check has nothing to subscribe to, so there is nothing to clean up. */
const subscribe = () => () => {};

/**
 * Shows its children only while the decorations are meant to be up.
 *
 * The check runs in the browser rather than on the server, because these
 * pages are built once and cached: a date decided at build time would still
 * say "December" in February. The server snapshot is always "off", so the
 * server and the first browser render agree and React never warns about a
 * mismatch; the browser then switches to the real answer.
 */
export default function ChristmasOnly({ children }: { children: ReactNode }) {
  const show = useSyncExternalStore(subscribe, () => christmasIsOn(), () => false);
  return show ? <>{children}</> : null;
}
