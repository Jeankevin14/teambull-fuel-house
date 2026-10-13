/** Weight plates drop onto the bar one by one while something loads. */
export default function BarbellLoader({
  label = "Loading…",
}: {
  label?: string;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 py-16 text-muted"
      role="status"
    >
      <div className="ml-stack" aria-hidden="true">
        <b /><b /><b /><b /><b />
      </div>
      <span className="text-sm font-semibold uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}
