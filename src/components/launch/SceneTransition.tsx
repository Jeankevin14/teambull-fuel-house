import type { ReactNode } from "react";

/**
 * The cut between scenes: the incoming scene rises out of a slight blur and
 * scale while a red wipe crosses the frame, so changes read as directed rather
 * than as a jump. Remounting on `sceneKey` is what restarts the animation.
 */
export default function SceneTransition({
  sceneKey,
  children,
}: {
  sceneKey: string;
  children: ReactNode;
}) {
  return (
    <div key={sceneKey} className="tb-trans">
      {children}
      <span className="tb-wipe" aria-hidden="true" />
    </div>
  );
}
