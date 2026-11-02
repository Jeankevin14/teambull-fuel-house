/** Scene 2 — what the brand is, in its own words from the About page. */
export default function BrandScene({ pillars }: { pillars: { word: string; text: string }[] }) {
  return (
    <div className="tb-scene">
      <p className="tb-eyebrow">Our story</p>
      <h2 className="tb-head">
        Built for <em>transformation</em>
      </h2>
      <p className="tb-sub">
        A performance-driven bodybuilding and fitness coaching brand, built around one idea:
        help people transform their bodies, build discipline and create a stronger lifestyle.
      </p>
      <div className="tb-list">
        {pillars.map((p, i) => (
          <div key={p.word} className="tb-item" style={{ animationDelay: `${0.9 + i * 0.45}s` }}>
            <span className="tb-num">{String(i + 1).padStart(2, "0")}</span>
            <span>
              <b>{p.word}</b>
              <span>{p.text}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
