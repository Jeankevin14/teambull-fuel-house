import type { ReactNode } from "react";

/** Standard page wrapper with a two-colour heading: "First <orange>Second</orange>". */
export default function PageShell({
  first,
  second,
  children,
  narrow = true,
}: {
  first: string;
  second: string;
  children: ReactNode;
  narrow?: boolean;
}) {
  return (
    <div className={`mx-auto px-4 py-12 ${narrow ? "max-w-3xl" : "max-w-6xl"}`}>
      <h1 className="font-display text-4xl font-bold uppercase">
        {first} <span className="text-accent">{second}</span>
      </h1>
      <div className="mt-6 space-y-4 text-muted">{children}</div>
    </div>
  );
}
