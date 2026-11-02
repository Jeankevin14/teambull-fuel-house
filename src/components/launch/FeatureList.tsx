/** The shared shape the feature scenes use: a title, a line, and numbered facts. */
export default function FeatureList({
  eyebrow,
  head,
  accent,
  sub,
  items,
  note,
}: {
  eyebrow: string;
  head: string;
  /** the part of the heading shown in brand red */
  accent?: string;
  sub?: string;
  items: { title: string; detail: string }[];
  note?: string;
}) {
  return (
    <div className="tb-scene">
      <p className="tb-eyebrow">{eyebrow}</p>
      <h2 className="tb-head">
        {head} {accent && <em>{accent}</em>}
      </h2>
      {sub && <p className="tb-sub">{sub}</p>}
      <div className="tb-list">
        {items.map((it, i) => (
          <div key={it.title} className="tb-item" style={{ animationDelay: `${0.7 + i * 0.45}s` }}>
            <span className="tb-num">{String(i + 1).padStart(2, "0")}</span>
            <span>
              <b>{it.title}</b>
              <span>{it.detail}</span>
            </span>
          </div>
        ))}
      </div>
      {note && (
        <p className="tb-sub" style={{ animationDelay: "1.6s", fontSize: "0.8rem", opacity: 0.6 }}>
          {note}
        </p>
      )}
    </div>
  );
}
