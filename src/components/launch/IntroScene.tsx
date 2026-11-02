/**
 * Scene 1 — black, then a single light, then the mark.
 * `phase` lets the one scene play two beats without a hard cut.
 */
export default function IntroScene({ phase }: { phase: "dark" | "logo" }) {
  if (phase === "dark") {
    return (
      <div className="tb-scene">
        <span className="tb-dawn" aria-hidden="true" />
      </div>
    );
  }
  return (
    <div className="tb-scene">
      <span className="tb-logo-wrap is-revealing">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/teambull-logo.png" alt="Team Bull Fuel House" className="tb-logo is-revealing" />
        <span className="tb-logo-sheen" aria-hidden="true" />
      </span>
      <h1 className="tb-head" style={{ animationDelay: "1.1s" }}>
        Teambull <em>Fuel House</em>
      </h1>
      <span className="tb-hair" style={{ animationDelay: "1.7s" }} aria-hidden="true" />
      <p className="tb-sub" style={{ animationDelay: "2s", letterSpacing: "0.2em", textTransform: "uppercase" }}>
        Genuine supplements. Puducherry.
      </p>
    </div>
  );
}
