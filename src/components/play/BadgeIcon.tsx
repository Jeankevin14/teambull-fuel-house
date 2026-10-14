import type { BadgeId, Medal } from "@/lib/badges";

const TIER: Record<Medal | "locked", { a: string; b: string; ink: string }> = {
  gold: { a: "#fde68a", b: "#b8860b", ink: "#1a1a1a" },
  silver: { a: "#f1f5f9", b: "#7b8794", ink: "#1a1a1a" },
  locked: { a: "#f3f4f6", b: "#d1d5db", ink: "#9ca3af" },
};

function Glyph({ id, ink }: { id: BadgeId; ink: string }) {
  switch (id) {
    case "memory": // plate
      return (
        <g>
          <circle cx="50" cy="48" r="20" fill={ink} />
          <circle cx="50" cy="48" r="12.5" fill="none" stroke="#fff" strokeWidth="2.5" />
          <circle cx="50" cy="48" r="4" fill="#fff" />
        </g>
      );
    case "rep": // dumbbell
      return (
        <g fill={ink}>
          <rect x="26" y="40" width="7" height="20" rx="2" />
          <rect x="33" y="34" width="7" height="32" rx="2" />
          <rect x="40" y="47" width="20" height="6" />
          <rect x="60" y="34" width="7" height="32" rx="2" />
          <rect x="67" y="40" width="7" height="20" rx="2" />
        </g>
      );
    case "quiz": // question mark
      return (
        <text x="50" y="62" textAnchor="middle" fontSize="40" fontWeight="800" fill={ink} fontFamily="Arial, sans-serif">
          ?
        </text>
      );
    default: // legend: crown
      return <path d="M30 62V38l12 12 8-16 8 16 12-12v24z" fill={ink} />;
  }
}

/** A round medal-style badge. `tier` null = locked. */
export default function BadgeIcon({ id, tier, className = "h-24 w-24" }: { id: BadgeId; tier: Medal | null; className?: string }) {
  const t = TIER[tier ?? "locked"];
  const gid = `bg-${id}-${tier ?? "locked"}`;
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={t.a} />
          <stop offset="1" stopColor={t.b} />
        </linearGradient>
      </defs>
      <polygon points="50,4 90,27 90,73 50,96 10,73 10,27" fill={`url(#${gid})`} stroke={tier ? "#1a1a1a" : "#d1d5db"} strokeWidth="3" strokeLinejoin="round" />
      <polygon points="50,12 83,31 83,69 50,88 17,69 17,31" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="1.5" />
      <Glyph id={id} ink={t.ink} />
      {tier && <path d="M50 76l2.6 5.2 5.7.8-4.1 4 1 5.7-5.2-2.7-5.2 2.7 1-5.7-4.1-4 5.7-.8z" fill="#dc2626" transform="translate(0 -8) scale(1)" />}
    </svg>
  );
}
