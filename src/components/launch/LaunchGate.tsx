"use client";

/** The opening screen: the mark, and the button that starts the film. */
export default function LaunchGate({ onLaunch }: { onLaunch: () => void }) {
  return (
    <div className="tb-gate">
      <span className="tb-logo-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/teambull-logo.png" alt="Team Bull Fuel House" className="tb-logo" />
      </span>
      <button type="button" className="tb-launch" onClick={onLaunch} aria-label="Play the launch film">
        <span className="tb-ring" aria-hidden="true" />
        <span className="tb-ring two" aria-hidden="true" />
        <span>Launch</span>
      </button>
      <p className="tb-sub" style={{ fontSize: "0.82rem", opacity: 0.6 }}>
        About 70 seconds. Sound is off until you turn it on.
      </p>
    </div>
  );
}
