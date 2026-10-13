/** A red strip with gym words sliding past. Pure CSS, no JavaScript. */
const WORDS = [
  "WHEY PROTEIN",
  "CREATINE",
  "PRE-WORKOUT",
  "MASS GAINER",
  "BCAA & EAA",
  "VITAMINS",
  "100% GENUINE",
];

export default function Marquee() {
  const row = (
    <>
      {WORDS.map((w) => (
        <span key={w} className="flex items-center gap-8 whitespace-nowrap">
          <span>{w}</span>
          <svg
            viewBox="0 0 40 16"
            className="h-4 w-10 shrink-0 opacity-90"
            fill="currentColor"
            aria-hidden="true"
          >
            <rect x="0" y="6" width="4" height="4" />
            <rect x="4" y="1" width="4" height="14" rx="1" />
            <rect x="8" y="3" width="3" height="10" rx="1" />
            <rect x="11" y="7" width="18" height="2" />
            <rect x="29" y="3" width="3" height="10" rx="1" />
            <rect x="32" y="1" width="4" height="14" rx="1" />
            <rect x="36" y="6" width="4" height="4" />
          </svg>
        </span>
      ))}
    </>
  );
  return (
    <div
      className="marquee overflow-hidden bg-accent py-3 font-display text-lg uppercase tracking-widest text-white"
      aria-hidden="true"
    >
      <div className="marquee-track flex w-max">
        <div className="flex gap-8 pr-8">{row}</div>
        <div className="flex gap-8 pr-8">{row}</div>
      </div>
    </div>
  );
}
