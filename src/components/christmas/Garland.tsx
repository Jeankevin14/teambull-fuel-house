/**
 * A pine garland hung under the header.
 *
 * The needles are not a picture file: they are worked out here, by walking a
 * curve and drawing a few hundred short strokes along it at alternating angles,
 * the way needles actually sit on a branch. The result is one small tile that
 * the browser repeats across any screen width, so it costs no network request
 * and never looks stretched.
 */
const TILE_W = 104;
const TILE_H = 36;

function pineTile() {
  const start = { x: 0, y: 3 };
  const control = { x: TILE_W / 2, y: 44 };
  const end = { x: TILE_W, y: 3 };
  const pointAt = (t: number) => ({
    x: (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * control.x + t * t * end.x,
    y: (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * control.y + t * t * end.y,
  });

  const needles: string[] = [];
  const steps = 56;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const p = pointAt(t);
    const next = pointAt(Math.min(1, t + 0.01));
    const along = Math.atan2(next.y - p.y, next.x - p.x);
    for (const side of [-1, 1]) {
      const angle = along + side * (0.8 + (i % 4) * 0.17);
      const length = 5 + ((i * 13) % 7);
      const shade = i % 4 === 0 ? "#15803d" : i % 3 === 0 ? "#166534" : "#14532d";
      needles.push(
        `<line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${(
          p.x + Math.cos(angle) * length
        ).toFixed(1)}" y2="${(p.y + Math.sin(angle) * length).toFixed(
          1
        )}" stroke="${shade}" stroke-width="1.5" stroke-linecap="round"/>`
      );
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE_W}" height="${TILE_H}" viewBox="0 0 ${TILE_W} ${TILE_H}">${needles.join(
    ""
  )}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const PINE = pineTile();

function Bauble({ gold, delay }: { gold: boolean; delay: string }) {
  const body = gold ? "#ca8a04" : "#dc2626";
  const shade = gold ? "#a16207" : "#991b1b";
  return (
    <svg
      viewBox="0 0 16 22"
      className="bauble h-[22px] w-4"
      style={{ animationDelay: delay }}
      aria-hidden="true"
    >
      <line x1="8" y1="0" x2="8" y2="6" stroke="#15803d" strokeWidth="1.2" />
      <rect x="6" y="5" width="4" height="3" rx="1" fill="#d6b45a" />
      <circle cx="8" cy="14" r="6" fill={body} />
      <path d="M8 8 A6 6 0 0 1 8 20 A6 6 0 0 0 8 8 Z" fill={shade} opacity="0.5" />
      <ellipse cx="6" cy="11.5" rx="1.8" ry="1.2" fill="#fff" opacity="0.6" />
    </svg>
  );
}

export default function Garland() {
  // Enough repeats to cross a very wide screen; the rest is simply clipped.
  const cells = Array.from({ length: 22 }, (_, i) => i);
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none flex h-[38px] w-full overflow-hidden"
      style={{
        backgroundImage: PINE,
        backgroundRepeat: "repeat-x",
        backgroundPosition: "top left",
        backgroundSize: `${TILE_W}px ${TILE_H}px`,
      }}
    >
      {cells.map((i) => (
        <span
          key={i}
          className="flex flex-none justify-center pt-[17px]"
          style={{ width: TILE_W }}
        >
          <Bauble gold={i % 2 === 1} delay={`${(i % 5) * 0.4}s`} />
        </span>
      ))}
    </div>
  );
}
