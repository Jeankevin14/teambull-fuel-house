"use client";

/** Always-available controls: skip, replay, sound. */
export default function LaunchControls({
  soundOn,
  onSound,
  onSkip,
  onReplay,
  finished,
  idle = false,
}: {
  soundOn: boolean;
  onSound: () => void;
  onSkip: () => void;
  onReplay: () => void;
  finished: boolean;
  /** true before the launch button is pressed: there is nothing to leave yet */
  idle?: boolean;
}) {
  return (
    <div className="tb-controls">
      <button type="button" className="tb-btn" onClick={onSound} aria-pressed={soundOn}>
        {soundOn ? "Sound on" : "Sound off"}
      </button>
      {idle ? null : finished ? (
        <button type="button" className="tb-btn" onClick={onReplay}>
          Replay
        </button>
      ) : (
        <button type="button" className="tb-btn" onClick={onSkip}>
          Skip intro
        </button>
      )}
    </div>
  );
}
