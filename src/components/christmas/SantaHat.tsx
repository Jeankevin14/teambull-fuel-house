/**
 * A hat for the logo, shaded rather than flat: the cone carries a diagonal
 * light-to-shadow gradient with a lit edge on one side and a turned-away edge
 * on the other, the fur band is built from overlapping tufts with a shadow
 * under its lip, and the bobble is a small sphere of its own.
 */
export default function SantaHat({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="-1 0 45 34" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="xmasHatCone" x1="0.15" y1="0.1" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#ff5b5b" />
          <stop offset="30%" stopColor="#e02424" />
          <stop offset="70%" stopColor="#b91c1c" />
          <stop offset="100%" stopColor="#7f1212" />
        </linearGradient>
        <linearGradient id="xmasHatSheen" x1="0" y1="0" x2="1" y2="0.7">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.34" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.22" />
        </linearGradient>
        <linearGradient id="xmasHatFur" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#f2f6fc" />
          <stop offset="100%" stopColor="#cfd9e8" />
        </linearGradient>
        <radialGradient id="xmasHatPom" cx="34%" cy="28%" r="78%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="58%" stopColor="#eef3fa" />
          <stop offset="100%" stopColor="#c3cfe0" />
        </radialGradient>
      </defs>
      <path d="M3 25 C5 14 13 4.5 23 2.6 C30.5 1.2 36 4.4 36.5 8.6 C37 13 33.5 17.5 28.5 21.5 L6 27 Z" fill="url(#xmasHatCone)" />
      <path d="M3 25 C5 14 13 4.5 23 2.6 C30.5 1.2 36 4.4 36.5 8.6 C37 13 33.5 17.5 28.5 21.5 L6 27 Z" fill="url(#xmasHatSheen)" />
      <path d="M6.5 24.6 C8 15.5 14.5 7.4 22.2 5.2 C18 10.2 12 17.5 9.6 25.4 Z" fill="#ffffff" opacity="0.17" />
      <path d="M27.5 20.6 C31 17.6 34.4 13.6 35.6 10.2 C36.2 14.4 33 18.6 29 21.4 Z" fill="#000000" opacity="0.18" />
      <path d="M0.8 22.6 C9 18.8 22 18.8 30.4 22.6 C32 25.6 31 30 28.2 31.4 C20 27.9 9 27.9 2.8 30.6 C0.4 29.4 -0.3 25.3 0.8 22.6 Z" fill="url(#xmasHatFur)" />
      <circle cx="4" cy="24.6" r="3.1" fill="#ffffff" opacity="0.9" />
      <circle cx="10" cy="22.9" r="3.3" fill="#ffffff" opacity="0.85" />
      <circle cx="16.5" cy="22.3" r="3.2" fill="#ffffff" opacity="0.9" />
      <circle cx="23" cy="22.7" r="3.1" fill="#ffffff" opacity="0.85" />
      <circle cx="28.6" cy="24.3" r="2.9" fill="#ffffff" opacity="0.9" />
      <path d="M1.4 27.8 C9 25.4 22 25.2 30.6 27.6 C30.2 29.8 29.3 30.9 28.2 31.4 C20 27.9 9 27.9 2.8 30.6 C1.9 30.1 1.5 29.1 1.4 27.8 Z" fill="#b9c6d8" opacity="0.45" />
      <circle cx="38.6" cy="7" r="5" fill="url(#xmasHatPom)" />
      <circle cx="36.9" cy="5.4" r="1.7" fill="#ffffff" opacity="0.95" />
      <path d="M34.6 10.6 a5 5 0 0 0 7.4 1.2" fill="none" stroke="#aebbcd" strokeWidth="1.1" opacity="0.6" strokeLinecap="round" />
    </svg>
  );
}
