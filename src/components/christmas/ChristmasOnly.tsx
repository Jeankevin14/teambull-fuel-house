"use client";

import { useEffect, useState, type ReactNode } from "react";
import { christmasIsOn } from "@/config/christmas";

/**
 * Shows its children only while the decorations are meant to be up.
 *
 * The check runs after the page has loaded rather than on the server, because
 * these pages are built once and cached: a date decided at build time would
 * still say "December" in February. Rendering nothing first also keeps the
 * server and the browser in agreement, so React never warns about a mismatch.
 */
export default function ChristmasOnly({ children }: { children: ReactNode }) {
  const [show, setShow] = useState(false);
  useEffect(() => setShow(christmasIsOn()), []);
  return show ? <>{children}</> : null;
}
