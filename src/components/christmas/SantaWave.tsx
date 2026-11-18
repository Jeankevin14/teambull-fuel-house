/**
 * Santa, waving.
 *
 * Two images stacked on the same canvas: his body, and his raised arm on its
 * own. The arm was cut from the body along a circle centred on his shoulder,
 * which is why the joint never opens a gap - a circle turned about its own
 * centre lands back on itself, so the sleeve stays closed at every angle. CSS
 * then turns the arm about that same point.
 *
 * Doing it this way rather than as a video or a GIF keeps him sharp on any
 * screen, lets the wave run on the graphics card, and costs 50 KB in total.
 */
const SHOULDER = "21.6% 28.4%";

export default function SantaWave() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative w-[108px] select-none sm:w-[132px] lg:w-[152px]"
      style={{ aspectRatio: "560 / 1008" }}
    >
      {/* eslint-disable @next/next/no-img-element */}
      <img
        src="/images/santa-body.webp"
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full"
      />
      <img
        src="/images/santa-arm.webp"
        alt=""
        loading="lazy"
        decoding="async"
        className="santa-arm absolute inset-0 h-full w-full"
        style={{ transformOrigin: SHOULDER }}
      />
      {/* eslint-enable @next/next/no-img-element */}
    </div>
  );
}
