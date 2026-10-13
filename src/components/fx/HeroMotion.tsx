"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { confetti } from "@/lib/motion";

const QUERY = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const m = window.matchMedia(QUERY);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};

const GOAL = 10;
const R = 44;
const C = 2 * Math.PI * R;
const RING = "TEAM BULL • FUEL HOUSE • LIFT • REPEAT • ";

/**
 * "Rep Counter" hero: a 3D power ring that tilts with your mouse.
 * Tap the centre to do a rep. Ten reps = BEAST MODE with confetti.
 * Built from Motion Lab 1 + 2 (rep ring, bending barbell, orbits, floating plates).
 */
export default function HeroMotion() {
  const still = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
  const [reps, setReps] = useState(0);
  const [beast, setBeast] = useState(false);
  const [pop, setPop] = useState(0);
  const tilt = useRef<HTMLDivElement>(null);

  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    if (still || e.pointerType === "touch" || !tilt.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    tilt.current.style.transform = `rotateY(${x * 18}deg) rotateX(${-y * 18}deg)`;
  };
  const leave = () => {
    if (tilt.current) tilt.current.style.transform = "";
  };

  const lift = (e: React.MouseEvent) => {
    if (beast) return;
    setPop((p) => p + 1);
    const next = reps + 1;
    if (next >= GOAL) {
      setReps(GOAL);
      setBeast(true);
      confetti(e.clientX, e.clientY);
      setTimeout(() => {
        setBeast(false);
        setReps(0);
      }, 2200);
    } else {
      setReps(next);
    }
  };

  return (
    <div
      className="hero-stage relative mx-auto aspect-[1/1.14] w-full max-w-[420px] select-none md:max-w-[480px]"
      onPointerMove={move}
      onPointerLeave={leave}
    >
      <div ref={tilt} className="hero-tilt">
        <div className="absolute left-[8%] top-0 aspect-square w-[84%]">
        {/* spinning brand text ring */}
        <svg
          viewBox="0 0 200 200"
          className="ml-spin-slow absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <defs>
            <path id="tb-ring" d="M100,100 m-84,0 a84,84 0 1,1 168,0 a84,84 0 1,1 -168,0" />
          </defs>
          <text
            fontSize="11"
            fontWeight="700"
            letterSpacing="2"
            fill="currentColor"
            className="text-foreground"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            <textPath href="#tb-ring" textLength="524" lengthAdjust="spacing">
              {RING}
            </textPath>
          </text>
        </svg>

        {/* dashed orbit with travelling dots */}
        <div className="ml-orbit-ring ml-spin-rev" aria-hidden="true">
          <i /><i style={{ top: "auto", bottom: -6 }} />
        </div>

        {/* the rep counter: tap to lift */}
        <button
          type="button"
          onClick={lift}
          aria-label={`Do a rep. ${reps} of ${GOAL}`}
          className="ml-rep"
        >
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
            <circle cx="50" cy="50" r={R} fill="none" strokeWidth="6" style={{ stroke: "var(--line)" }} />
            <circle
              cx="50"
              cy="50"
              r={R}
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - reps / GOAL)}
              style={{ stroke: "var(--accent)", transition: "stroke-dashoffset .35s" }}
            />
          </svg>
          <span className="relative z-10 flex flex-col items-center">
            {beast ? (
              <span className="ml-beast font-display text-3xl font-bold uppercase leading-none text-accent md:text-4xl">
                Beast
                <br />
                Mode!
              </span>
            ) : (
              <>
                <span
                  key={pop}
                  className="anim-pop font-display text-6xl font-bold leading-none text-accent md:text-7xl"
                >
                  {reps}
                </span>
                <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted md:text-xs">
                  / {GOAL} reps
                </span>
                <span className="ml-hint mt-2 rounded-full bg-accent px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white md:text-xs">
                  Tap to lift
                </span>
              </>
            )}
          </span>
        </button>

        </div>

        {/* floating weight plates at different depths */}
        <span className="ml-plate ml-float" style={{ left: "0%", top: "4%" }} aria-hidden="true">20</span>
        <span className="ml-plate ml-plate-dark ml-float" style={{ right: "0%", top: "4%", animationDelay: "-1.4s" }} aria-hidden="true">10</span>

        {/* barbell that flexes under the plates */}
        <svg viewBox="0 24 300 96" className="ml-bar absolute bottom-0 left-[4%] w-[92%]" aria-hidden="true">
          <g style={{ fill: "var(--accent)" }}>
            <rect x="14" y="30" width="12" height="60" rx="3">
              {!still && <animate attributeName="y" values="30;44;30" dur="2s" repeatCount="indefinite" />}
            </rect>
            <rect x="274" y="30" width="12" height="60" rx="3">
              {!still && <animate attributeName="y" values="30;44;30" dur="2s" repeatCount="indefinite" />}
            </rect>
          </g>
          <g fill="#888">
            <rect x="30" y="38" width="10" height="44" rx="3">
              {!still && <animate attributeName="y" values="38;52;38" dur="2s" repeatCount="indefinite" />}
            </rect>
            <rect x="260" y="38" width="10" height="44" rx="3">
              {!still && <animate attributeName="y" values="38;52;38" dur="2s" repeatCount="indefinite" />}
            </rect>
          </g>
          <path d="M40 60Q150 60 260 60" fill="none" stroke="#999" strokeWidth="7" strokeLinecap="round">
            {!still && (
              <animate
                attributeName="d"
                values="M40 60Q150 60 260 60;M40 74Q150 46 260 74;M40 60Q150 60 260 60"
                dur="2s"
                repeatCount="indefinite"
              />
            )}
          </path>
        </svg>
      </div>
    </div>
  );
}
