"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg bg-accent px-5 py-2 font-display font-bold uppercase text-white"
    >
      Print bill
    </button>
  );
}
