/** Snow settled along the bottom edge of the hero. */
export default function SnowDrift() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
    >
      <svg
        viewBox="0 0 1200 40"
        preserveAspectRatio="none"
        className="block h-7 w-full md:h-9"
      >
        <path
          d="M0 24 Q 80 12 160 20 Q 250 29 330 18 Q 420 7 500 17 Q 590 28 670 18 Q 760 7 840 16 Q 930 26 1010 17 Q 1100 8 1200 19 L1200 40 L0 40 Z"
          fill="#ffffff"
        />
        <path
          d="M0 24 Q 80 12 160 20 Q 250 29 330 18 Q 420 7 500 17 Q 590 28 670 18 Q 760 7 840 16 Q 930 26 1010 17 Q 1100 8 1200 19"
          fill="none"
          stroke="#dbe4f0"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}
