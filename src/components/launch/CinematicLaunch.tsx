"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import "./launch.css";

import BrandScene from "./BrandScene";
import CalculatorShowcase from "./CalculatorShowcase";
import FounderScene from "./FounderScene";
import GrandFinale from "./GrandFinale";
import IntroScene from "./IntroScene";
import LaunchControls from "./LaunchControls";
import LaunchGate from "./LaunchGate";
import PlayWinShowcase from "./PlayWinShowcase";
import ProductShowcase from "./ProductShowcase";
import SceneTransition from "./SceneTransition";
import ShoppingShowcase from "./ShoppingShowcase";
import SupplementFinderShowcase from "./SupplementFinderShowcase";
import { createAtmosphere } from "./atmosphere";
import { createSound } from "./launchAudio";
import type { LaunchData } from "./types";

type SceneId =
  | "dark" | "logo" | "brand"
  | "founder" | "cofounder" | "together"
  | "products" | "play" | "bmi" | "protein" | "finder" | "shopping"
  | "finale";

/** The running order, and how long each beat owns the screen. */
const SCENES: { id: SceneId; ms: number }[] = [
  { id: "dark", ms: 3600 },
  { id: "logo", ms: 6000 },
  { id: "brand", ms: 6000 },
  { id: "founder", ms: 4600 },
  { id: "cofounder", ms: 4600 },
  { id: "together", ms: 4000 },
  { id: "products", ms: 18000 },
  { id: "play", ms: 4600 },
  { id: "bmi", ms: 4400 },
  { id: "protein", ms: 4400 },
  { id: "finder", ms: 4000 },
  { id: "shopping", ms: 6400 },
  { id: "finale", ms: 7000 },
];

const TOTAL = SCENES.reduce((n, s) => n + s.ms, 0);

export default function CinematicLaunch({ data }: { data: LaunchData }) {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const [finished, setFinished] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const canvas = useRef<HTMLCanvasElement>(null);
  const air = useRef(createAtmosphere());
  const sound = useRef(createSound());
  const timers = useRef<number[]>([]);
  const startedAt = useRef(0);

  const scene = SCENES[index]?.id ?? "finale";

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  /** Queues the whole running order, with the sound and air cues for each beat. */
  const run = useCallback(() => {
    clearTimers();
    let at = 0;
    SCENES.forEach((s, i) => {
      timers.current.push(
        window.setTimeout(() => {
          setIndex(i);
          const snd = sound.current;
          const a = air.current;
          switch (s.id) {
            case "dark": a.setIntensity(0.3); snd.heartbeat(0.45); break;
            case "logo": a.setIntensity(1.3); a.swell(); snd.swell(5); snd.shimmer(); break;
            case "brand": a.setIntensity(0.7); snd.tick(); break;
            case "founder":
            case "cofounder": a.setIntensity(0.55); snd.heartbeat(0.3); break;
            case "together": a.setIntensity(0.9); snd.tick(); break;
            case "products": a.setIntensity(0.5); snd.tick(); break;
            case "shopping": a.setIntensity(0.6); snd.tick(); break;
            case "finale": a.setIntensity(1.7); a.swell(); snd.impact(); break;
            default: a.setIntensity(0.55); snd.tick();
          }
        }, at),
      );
      at += s.ms;
    });
    // the way in appears a little before the end, so nobody waits for it
    timers.current.push(window.setTimeout(() => setFinished(true), at - 3400));
  }, []);

  useEffect(() => {
    const cv = canvas.current;
    const a = air.current;
    const s = sound.current;
    if (cv) a.start(cv);
    a.setIntensity(0.35);
    document.body.classList.add("tb-takeover");
    return () => {
      document.body.classList.remove("tb-takeover");
      clearTimers();
      a.stop();
      s.close();
    };
  }, []);

  /** The button: the film starts here, and the clock starts with it. */
  const begin = () => {
    setStarted(true);
    startedAt.current = Date.now();
    setElapsed(0);
    run();
  };

  // the progress bar only ticks while something is playing
  useEffect(() => {
    if (!started) return;
    const tick = window.setInterval(() => setElapsed(Date.now() - startedAt.current), 300);
    return () => window.clearInterval(tick);
  }, [started]);

  const toggleSound = () => {
    const s = sound.current;
    if (s.on) {
      s.disable();
      setSoundOn(false);
    } else {
      s.enable();
      s.heartbeat(0.4);
      setSoundOn(true);
    }
  };

  const enterStore = useCallback(() => {
    clearTimers();
    setLeaving(true);
    window.setTimeout(() => router.push("/"), 450);
  }, [router]);

  const skip = useCallback(() => {
    sound.current.disable();
    setSoundOn(false);
    enterStore();
  }, [enterStore]);

  const replay = () => {
    setFinished(false);
    setStarted(true);
    setIndex(0);
    startedAt.current = Date.now();
    setElapsed(0);
    air.current.setIntensity(0.3);
    run();
  };

  // Escape leaves, as a keyboard visitor expects
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && started) skip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [skip, started]);

  const [founder, cofounder] = data.people;
  const progress = useMemo(() => Math.min(100, (elapsed / TOTAL) * 100), [elapsed]);

  return (
    <div className="tb">
      <div className={`tb-camera ${started && !leaving ? "is-running" : ""}`}>
        <div className="tb-room" />
        <div className="tb-metal" aria-hidden="true" />
        <div className="tb-smoke" aria-hidden="true" />
        <canvas ref={canvas} className="tb-canvas" aria-hidden="true" />

        {!started && <LaunchGate onLaunch={begin} />}

        {started && (
        <SceneTransition sceneKey={scene}>
          {scene === "dark" && <IntroScene phase="dark" />}
          {scene === "logo" && <IntroScene phase="logo" />}
          {scene === "brand" && <BrandScene pillars={data.pillars} />}
          {scene === "founder" && founder && <FounderScene person={founder} />}
          {scene === "cofounder" && cofounder && <FounderScene person={cofounder} />}
          {scene === "together" && data.people.length > 1 && <FounderScene pair={data.people} />}
          {scene === "products" && (
            <ProductShowcase
              groups={data.range}
              productCount={data.productCount}
              categoryCount={data.categories.length}
            />
          )}
          {scene === "play" && <PlayWinShowcase />}
          {scene === "bmi" && <CalculatorShowcase which="bmi" />}
          {scene === "protein" && <CalculatorShowcase which="protein" />}
          {scene === "finder" && <SupplementFinderShowcase />}
          {scene === "shopping" && <ShoppingShowcase items={data.cart} />}
          {scene === "finale" && (
            <GrandFinale url={data.url} showEnter={finished} onEnter={enterStore} />
          )}
        </SceneTransition>
        )}

        <div className="tb-vignette" aria-hidden="true" />
      </div>

      <LaunchControls
        soundOn={soundOn}
        onSound={toggleSound}
        onSkip={skip}
        onReplay={replay}
        finished={finished || !started}
        idle={!started}
      />

      <div className="tb-progress" aria-hidden="true">
        <i style={{ width: `${progress}%` }} />
      </div>

      <div className={`tb-curtain ${leaving ? "is-closing" : ""}`} aria-hidden="true" />
    </div>
  );
}
