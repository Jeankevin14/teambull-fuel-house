/** The green badge on a product you are running a Christmas offer on. */
export default function ChristmasOffer() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-700 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow-sm">
      <svg viewBox="0 0 14 14" className="h-3 w-3" aria-hidden="true">
        <path d="M7 1 L8.6 4.6 L12.6 5 L9.6 7.7 L10.5 11.6 L7 9.6 L3.5 11.6 L4.4 7.7 L1.4 5 L5.4 4.6 Z" fill="#fde68a" />
      </svg>
      Christmas offer
    </span>
  );
}
