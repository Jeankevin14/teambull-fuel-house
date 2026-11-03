/**
 * The MADE IN USA mark.
 *
 * It is drawn rather than photographed, so it stays sharp at any size and on
 * any screen, and it is driven by `madeIn: "USA"` in the catalogue — so adding
 * it to another product, or taking it off one, is a one-word change.
 *
 * `overlay` is the version that sits on top of a pack photo; the plain one sits
 * in the page next to the product name.
 */

const STRIPES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const STAR_ROWS = [0, 1, 2, 3, 4];

function Flag({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 38 20"
      aria-hidden="true"
      className={`shrink-0 rounded-[1.5px] ${className}`}
    >
      {/* 13 stripes, red on white */}
      <rect width="38" height="20" fill="#ffffff" />
      {STRIPES.filter((i) => i % 2 === 0).map((i) => (
        <rect key={i} y={(i * 20) / 13} width="38" height={20 / 13} fill="#b22234" />
      ))}
      {/* the canton */}
      <rect width="15.2" height={(7 * 20) / 13} fill="#3c3b6e" />
      {STAR_ROWS.map((r) =>
        [0, 1, 2, 3].map((c) => (
          <circle
            key={`${r}-${c}`}
            cx={2.1 + c * 3.7 + (r % 2 ? 1.85 : 0)}
            cy={1.5 + r * 2.1}
            r="0.62"
            fill="#ffffff"
          />
        ))
      )}
    </svg>
  );
}

export default function MadeInUsa({ overlay = false }: { overlay?: boolean }) {
  // The pack photos sit on black today and may sit on white tomorrow, so the
  // badge on the photo is a white pill with its own hairline: it reads either way.
  const skin = overlay
    ? "bg-white/95 text-foreground ring-1 ring-black/15 shadow-sm backdrop-blur-sm"
    : "bg-foreground text-white ring-1 ring-black/10";

  return (
    <span
      title="Made in the USA"
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${skin}`}
    >
      <Flag className="h-3 w-[22px]" />
      <span className="font-display text-[10px] font-bold uppercase leading-none tracking-[0.12em]">
        Made in USA
      </span>
    </span>
  );
}
