/**
 * The air in the room: embers drifting upward in the dark, lit brand-red, with a
 * slow light sweep across the frame. Deliberately cheap — a few hundred dots on
 * one canvas, no 3D — so an ordinary phone holds a steady frame rate for a minute.
 */

type Mote = { x: number; y: number; vx: number; vy: number; r: number; a: number; tw: number };

const EMBER = ["#dc2626", "#ff5a5a", "#ffffff", "#7f1414"];

export type Atmosphere = {
  start: (canvas: HTMLCanvasElement) => void;
  stop: () => void;
  /** 0 = still air, 2 = storm; the scenes turn it up and down */
  setIntensity: (v: number) => void;
  /** one upward push, for a reveal */
  swell: () => void;
};

export function createAtmosphere(): Atmosphere {
  let raf = 0;
  let motes: Mote[] = [];
  let ctx: CanvasRenderingContext2D | null = null;
  let cvs: HTMLCanvasElement | null = null;
  let w = 0;
  let h = 0;
  let intensity = 1;
  let sweep = -0.3;
  let reduced = false;
  let resetAt = 0;

  const seed = (n: number) => {
    motes = Array.from({ length: n }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.12,
      vy: -(0.12 + Math.random() * 0.4),
      r: 0.6 + Math.random() * 1.8,
      a: 0.14 + Math.random() * 0.46,
      tw: Math.random() * Math.PI * 2,
    }));
  };

  const fit = () => {
    if (!cvs) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    cvs.width = Math.floor(w * dpr);
    cvs.height = Math.floor(h * dpr);
    cvs.style.width = `${w}px`;
    cvs.style.height = `${h}px`;
    ctx = cvs.getContext("2d");
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed(w < 640 ? 85 : 160);
  };

  const frame = () => {
    raf = requestAnimationFrame(frame);
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);

    if (resetAt && Date.now() > resetAt) {
      for (const m of motes) m.vy = -(0.12 + Math.random() * 0.4);
      resetAt = 0;
    }

    sweep += reduced ? 0 : 0.0012;
    if (sweep > 1.3) sweep = -0.3;
    const sx = sweep * w;
    const band = ctx.createLinearGradient(sx - w * 0.3, 0, sx + w * 0.3, h);
    band.addColorStop(0, "rgba(220,38,38,0)");
    band.addColorStop(0.5, `rgba(255,90,90,${0.05 * intensity})`);
    band.addColorStop(1, "rgba(220,38,38,0)");
    ctx.fillStyle = band;
    ctx.fillRect(0, 0, w, h);

    for (const m of motes) {
      if (!reduced) {
        m.x += m.vx * intensity;
        m.y += m.vy * intensity;
        m.tw += 0.03;
      }
      if (m.y < -10) {
        m.y = h + 10;
        m.x = Math.random() * w;
      }
      if (m.x < -10) m.x = w + 10;
      if (m.x > w + 10) m.x = -10;

      const twinkle = 0.65 + Math.sin(m.tw) * 0.35;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fillStyle = EMBER[(m.r * 10) % EMBER.length | 0] ?? EMBER[0];
      ctx.globalAlpha = Math.min(1, m.a * twinkle * intensity);
      ctx.shadowBlur = 9;
      ctx.shadowColor = "rgba(255,90,90,0.9)";
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  };

  return {
    start(canvas) {
      cvs = canvas;
      reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      fit();
      window.addEventListener("resize", fit);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
    },
    stop() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", fit);
      motes = [];
      ctx = null;
      cvs = null;
      resetAt = 0;
    },
    setIntensity(v) {
      intensity = Math.max(0, Math.min(2, v));
    },
    swell() {
      if (reduced) return;
      for (const m of motes) m.vy -= 0.5 + Math.random() * 0.9;
      resetAt = Date.now() + 1400; // settles again inside the animation loop
    },
  };
}
