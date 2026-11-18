/**
 * Snow settled along the bottom edge of the hero.
 *
 * Two banks rather than one outline: a cooler one behind and a brighter one in
 * front, with a lit crest along the front edge and its shadow just beneath.
 * That gap between the two edges is what gives the snow thickness.
 */
export default function SnowDrift() {
  const front =
    "M0 34 Q 60 22 130 30 Q 210 39 290 27 Q 380 14 470 28 Q 560 41 650 28 Q 740 16 830 29 Q 868 34 900 30";
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
      <svg viewBox="0 0 900 60" preserveAspectRatio="none" className="block h-10 w-full md:h-12">
        <defs>
          <linearGradient id="xmasDriftBack" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e3ebf6" />
            <stop offset="100%" stopColor="#f5f8fc" />
          </linearGradient>
          <linearGradient id="xmasDriftFront" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="55%" stopColor="#fbfdff" />
            <stop offset="100%" stopColor="#e8eef8" />
          </linearGradient>
        </defs>
        <path
          d="M0 26 Q 70 10 150 20 Q 240 31 320 15 Q 410 2 500 16 Q 590 30 680 16 Q 770 4 860 18 Q 882 21 900 18 L900 60 L0 60 Z"
          fill="url(#xmasDriftBack)"
        />
        <path d={`${front} L900 60 L0 60 Z`} fill="url(#xmasDriftFront)" />
        <path d={front} fill="none" stroke="#ffffff" strokeWidth="2.4" opacity="0.95" />
        <path
          d="M0 37.5 Q 60 25.5 130 33.5 Q 210 42.5 290 30.5 Q 380 17.5 470 31.5 Q 560 44.5 650 31.5 Q 740 19.5 830 32.5 Q 868 37.5 900 33.5"
          fill="none"
          stroke="#c9d6e8"
          strokeWidth="1.5"
          opacity="0.55"
        />
      </svg>
    </div>
  );
}
