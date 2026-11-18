"use client";

import { useEffect, useRef } from "react";

type Flake = {
  x: number;
  y: number;
  r: number;
  fall: number;
  sway: number;
  phase: number;
  alpha: number;
};

/**
 * Snow across the whole window.
 *
 * The site is white, so white snow would be invisible - these flakes are a pale
 * blue-grey, the colour snow actually reads as against a bright sky. One canvas
 * rather than a few dozen elements, so the browser draws it in a single pass.
 *
 * It behaves itself: nothing at all for a visitor who has asked for reduced
 * motion, the loop stops while the tab is in the background, and the number of
 * flakes follows the screen width so a phone is not asked to draw a desktop's
 * worth of them.
 */
export default function Snowfall() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let flakes: Flake[] = [];
    let frameId = 0;
    let lastTime = 0;
    let wind = 0;
    let windTarget = 0;

    const makeFlake = (startAnywhere: boolean): Flake => {
      const r = 1 + Math.random() * 2.2;
      return {
        x: Math.random() * width,
        y: startAnywhere ? Math.random() * height : -10,
        r,
        fall: 11 + r * 12,
        sway: 7 + Math.random() * 15,
        phase: Math.random() * Math.PI * 2,
        // Bigger flakes read as nearer, so they are both faster and clearer.
        alpha: 0.22 + (r / 3.2) * 0.38,
      };
    };

    const measure = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.round(Math.min(70, Math.max(22, width / 22)));
      flakes = Array.from({ length: count }, () => makeFlake(true));
    };

    const draw = (time: number) => {
      // Capped, so a tab that was asleep does not teleport the snow downward.
      const dt = Math.min(0.05, (time - lastTime) / 1000);
      lastTime = time;
      wind += (windTarget - wind) * Math.min(1, dt * 1.6);
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i];
        f.phase += dt * 0.8;
        f.y += f.fall * dt;
        f.x += (Math.sin(f.phase) * f.sway + wind * (f.r / 2.4)) * dt;

        if (f.y - f.r > height) {
          flakes[i] = makeFlake(false);
          continue;
        }
        if (f.x < -12) f.x = width + 12;
        else if (f.x > width + 12) f.x = -12;

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(150,178,214,${f.alpha})`;
        ctx.fill();
      }
      frameId = requestAnimationFrame(draw);
    };

    const start = () => {
      if (frameId) return;
      lastTime = performance.now();
      frameId = requestAnimationFrame(draw);
    };
    const stop = () => {
      if (!frameId) return;
      cancelAnimationFrame(frameId);
      frameId = 0;
    };

    // The snow leans the way the pointer moves - a breeze, not a game.
    const onPointerMove = (e: PointerEvent) => {
      windTarget = (e.clientX / Math.max(1, width) - 0.5) * 34;
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    measure();
    start();
    window.addEventListener("resize", measure);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      window.removeEventListener("resize", measure);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60]"
    />
  );
}
