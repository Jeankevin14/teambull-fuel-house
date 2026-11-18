/**
 * A hat for the logo: a floppy red cone, a fur band around the base and a
 * bobble at the tip. Shaded down one side so it reads as cloth rather than a
 * flat triangle.
 */
export default function SantaHat({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="-1 0 45 34" className={className} aria-hidden="true">
      <path d="M3 25 C5 14 13 4.5 23 2.6 C30.5 1.2 36 4.4 36.5 8.6 C37 13 33.5 17.5 28.5 21.5 L6 27 Z" fill="#dc2626" />
      <path d="M3 25 C5 15 13 5.5 22 3.6 C26 2.8 29.5 3.6 31.8 5.6 C23 8.6 12 16 8.5 26.2 Z" fill="#b91c1c" opacity="0.5" />
      <path d="M0.8 22.6 C9 18.8 22 18.8 30.4 22.6 C32 25.6 31 30 28.2 31.4 C20 27.9 9 27.9 2.8 30.6 C0.4 29.4 -0.3 25.3 0.8 22.6 Z" fill="#ffffff" />
      <path d="M0.8 22.6 C9 18.8 22 18.8 30.4 22.6 C23 24.6 11 25.6 3.2 29.2 Z" fill="#e6edf6" />
      <circle cx="38.5" cy="7.2" r="4.6" fill="#ffffff" />
      <circle cx="37" cy="5.9" r="1.9" fill="#f6f9ff" />
    </svg>
  );
}
