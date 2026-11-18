/**
 * A pine garland hung under the header.
 *
 * Depth, not a flat cut-out. The needles are three passes along the same curve:
 * a dark layer set back, a mid layer, and a lit layer in front, each offset a
 * little and drawn thinner and brighter than the one behind it. That is what
 * makes the branch read as round rather than printed.
 *
 * It is worked out here rather than loaded as a picture: the result is one
 * small tile the browser repeats across any width, so it costs no network
 * request and never stretches. The baubles are drawn separately so each one can
 * swing on its own.
 */
const TILE_W = 120;
const TILE_H = 36;

function pineTile() {
  const start = { x: 0, y: 5 };
  const control = { x: TILE_W / 2, y: 42 };
  const end = { x: TILE_W, y: 5 };
  const pointAt = (t: number) => ({
    x: (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * control.x + t * t * end.x,
    y: (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * control.y + t * t * end.y,
  });

  const layer = (
    index: number,
    drop: number,
    dark: string,
    light: string,
    weight: number,
    shortest: number,
    longest: number,
    opacity: number
  ) => {
    const out: string[] = [];
    const steps = 52;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const p = pointAt(t);
      const y = p.y + drop;
      const next = pointAt(Math.min(1, t + 0.01));
      const along = Math.atan2(next.y + drop - y, next.x - p.x);
      for (const side of [-1, 1]) {
        const angle = along + side * (0.72 + ((i + index) % 4) * 0.16);
        const length =
          shortest + ((i * 13 + index * 5) % (longest - shortest + 1));
        const shade = (i + index) % 3 === 0 ? light : dark;
        out.push(
          `<line x1="${p.x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(
            p.x + Math.cos(angle) * length
          ).toFixed(1)}" y2="${(y + Math.sin(angle) * length).toFixed(
            1
          )}" stroke="${shade}" stroke-width="${weight}" stroke-linecap="round" opacity="${opacity}"/>`
        );
      }
    }
    return out.join("");
  };

  const needles =
    layer(0, 2.0, "#0b3d22", "#115e33", 1.9, 6, 11, 0.9) +
    layer(1, 0.6, "#14532d", "#166534", 1.6, 5, 10, 1) +
    layer(2, -1.0, "#16803d", "#2faa5a", 1.2, 4, 8, 1);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE_W}" height="${TILE_H}" viewBox="0 0 ${TILE_W} ${TILE_H}">${needles}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const PINE = pineTile();

/** Shared once for every bauble on the page rather than repeated in each one. */
function BaubleShading() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true">
      <defs>
        <radialGradient id="xmasBallRed" cx="33%" cy="25%" r="80%">
          <stop offset="0%" stopColor="#f05252" />
          <stop offset="44%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#7a0f0f" />
        </radialGradient>
        <radialGradient id="xmasBallGold" cx="33%" cy="25%" r="80%">
          <stop offset="0%" stopColor="#f6cf6a" />
          <stop offset="44%" stopColor="#ca8a04" />
          <stop offset="100%" stopColor="#6f4c05" />
        </radialGradient>
        <radialGradient id="xmasOcclusion" cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.36" />
        </radialGradient>
        <linearGradient id="xmasCap" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8a6a21" />
          <stop offset="34%" stopColor="#f3dd93" />
          <stop offset="62%" stopColor="#c9a240" />
          <stop offset="100%" stopColor="#7d5f1c" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * One hanging bauble. The sphere is a radial gradient lit from the upper left,
 * darkened at the edge so it turns away from the light, with a specular
 * highlight, a tiny hot spot inside it and a bounced rim light along the lower
 * edge - the four things that stop a circle looking like a circle.
 */
function Bauble({
  gold,
  delay,
  far,
}: {
  gold: boolean;
  delay: string;
  far: boolean;
}) {
  const r = far ? 7.5 : 9;
  const cy = 7 + r;
  return (
    <svg
      viewBox="-12 -8 24 36"
      className="bauble w-6"
      style={{ animationDelay: delay, opacity: far ? 0.93 : 1 }}
      aria-hidden="true"
    >
      <line x1="0" y1="-6" x2="0" y2="2" stroke="#0f5132" strokeWidth="1.5" />
      <path
        d="M-3 1 h6 a1.3 1.3 0 0 1 1.3 1.3 v3.4 a1.3 1.3 0 0 1 -1.3 1.3 h-6 a1.3 1.3 0 0 1 -1.3 -1.3 v-3.4 a1.3 1.3 0 0 1 1.3 -1.3 z"
        fill="url(#xmasCap)"
      />
      <circle cx="0" cy={cy} r={r} fill={`url(#${gold ? "xmasBallGold" : "xmasBallRed"})`} />
      <circle cx="0" cy={cy} r={r} fill="url(#xmasOcclusion)" />
      <ellipse
        cx={-r * 0.36}
        cy={7 + r * 0.45}
        rx={r * 0.3}
        ry={r * 0.2}
        fill="#ffffff"
        opacity="0.7"
        transform={`rotate(-28 ${-r * 0.36} ${7 + r * 0.45})`}
      />
      <ellipse cx={-r * 0.48} cy={7 + r * 0.32} rx={r * 0.12} ry={r * 0.085} fill="#ffffff" opacity="0.95" />
      <path
        d={`M${-r * 0.82} ${7 + r * 1.42} a${r} ${r} 0 0 0 ${r * 1.5} ${r * 0.28}`}
        fill="none"
        stroke={gold ? "#ffe9a8" : "#ff9b9b"}
        strokeWidth="2"
        opacity="0.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Garland() {
  // Enough repeats to cross a very wide screen; the rest is simply clipped.
  const cells = Array.from({ length: 22 }, (_, i) => i);
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative flex h-[54px] w-full overflow-hidden"
      style={{
        backgroundImage: PINE,
        backgroundRepeat: "repeat-x",
        backgroundPosition: "top left",
        backgroundSize: `${TILE_W}px ${TILE_H}px`,
      }}
    >
      <BaubleShading />
      {cells.map((i) => (
        <span
          key={i}
          className="flex flex-none justify-center pt-[18px]"
          style={{ width: TILE_W }}
        >
          {/* every third one hangs a little further back, so the row has depth */}
          <Bauble gold={i % 2 === 1} far={i % 3 === 1} delay={`${(i % 5) * 0.37}s`} />
        </span>
      ))}
    </div>
  );
}
