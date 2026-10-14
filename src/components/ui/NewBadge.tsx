/** A small red "NEW" tag with a soft pulsing ring. */
export default function NewBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`new-badge relative isolate inline-block rounded-full bg-accent px-1.5 py-0.5 align-middle font-display text-[10px] font-bold uppercase leading-none tracking-wider text-white ${className}`}>
      New
    </span>
  );
}
