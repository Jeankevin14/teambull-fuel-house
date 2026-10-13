const BARS = [90, 60, 100, 45, 80, 100, 55, 90, 70, 100, 50, 85];

/** A laser scans a barcode, then a tick draws. Used for "Genuine Products". */
export default function AuthenticScan() {
  return (
    <div className="mx-auto mb-4 h-16 w-24" aria-hidden="true">
      <div className="ml-scan">
        {BARS.map((h, i) => (
          <i key={i} style={{ height: `${h}%` }} />
        ))}
        <div className="ml-ok">
          <svg viewBox="0 0 24 24">
            <path d="M5 12l5 5 9-10" />
          </svg>
        </div>
      </div>
    </div>
  );
}
