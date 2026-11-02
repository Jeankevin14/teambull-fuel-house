import Link from "next/link";

/** Scene 9 — the mark returns, the words land, and the door opens. */
export default function GrandFinale({
  url,
  showEnter,
  onEnter,
}: {
  url: string;
  showEnter: boolean;
  onEnter: () => void;
}) {
  return (
    <div className="tb-scene">
      <span className="tb-logo-wrap is-revealing">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/teambull-logo.png" alt="Team Bull Fuel House" className="tb-logo is-revealing" />
        <span className="tb-logo-sheen" aria-hidden="true" />
      </span>
      <h2 className="tb-head" style={{ animationDelay: "0.8s", fontSize: "clamp(1.5rem,5.2vw,3.2rem)" }}>
        Teambull <em>Fuel House</em>
      </h2>
      <h2
        className="tb-head"
        style={{ animationDelay: "1.4s", fontSize: "clamp(1.1rem,3.6vw,2rem)", letterSpacing: "0.3em" }}
      >
        <em>Grand launch</em>
      </h2>
      <span className="tb-hair" style={{ animationDelay: "1.9s" }} aria-hidden="true" />
      <p className="tb-sub tb-url" style={{ animationDelay: "2.2s" }}>
        {url}
      </p>
      {showEnter && (
        <Link href="/" className="tb-enter" onClick={onEnter}>
          Enter the store
        </Link>
      )}
    </div>
  );
}
