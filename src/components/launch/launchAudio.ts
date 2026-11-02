/**
 * Sound for the launch experience, made in the browser with the Web Audio API so
 * there are no audio files to download.
 *
 * Sound is OFF until the visitor turns it on. Nothing here is created before
 * that, so the page never autoplays and never asks for audio it will not use.
 */

export type Sound = {
  enable: () => void;
  disable: () => void;
  readonly on: boolean;
  heartbeat: (gain?: number) => void;
  /** low cinematic swell under a reveal */
  swell: (seconds?: number) => void;
  /** metallic shimmer for the logo */
  shimmer: () => void;
  /** soft transition between scenes */
  tick: () => void;
  /** the final hit */
  impact: () => void;
  close: () => void;
};

export function createSound(): Sound {
  let ctx: AudioContext | null = null;
  let bus: GainNode | null = null;
  let on = false;

  const ready = () => {
    if (!on) return null;
    if (!ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
      bus = ctx.createGain();
      bus.gain.value = 0.9;
      bus.connect(ctx.destination);
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  };

  const voice = (
    freq: number,
    dur: number,
    peak: number,
    type: OscillatorType = "sine",
    slideTo?: number,
  ) => {
    const a = ready();
    if (!a || !bus) return;
    const osc = a.createOscillator();
    const g = a.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, a.currentTime);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, a.currentTime + dur);
    g.gain.setValueAtTime(0.0001, a.currentTime);
    g.gain.exponentialRampToValueAtTime(peak, a.currentTime + Math.min(0.08, dur / 3));
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
    osc.connect(g).connect(bus);
    osc.start();
    osc.stop(a.currentTime + dur + 0.05);
  };

  const noise = (dur: number, peak: number, hz: number) => {
    const a = ready();
    if (!a || !bus) return;
    const frames = Math.floor(a.sampleRate * dur);
    const buf = a.createBuffer(1, frames, a.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
    const src = a.createBufferSource();
    src.buffer = buf;
    const f = a.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = hz;
    const g = a.createGain();
    g.gain.value = peak;
    src.connect(f).connect(g).connect(bus);
    src.start();
  };

  return {
    enable() {
      on = true;
      ready();
    },
    disable() {
      on = false;
      if (bus) bus.gain.value = 0;
    },
    get on() {
      return on;
    },
    heartbeat(gain = 0.5) {
      voice(58, 0.3, gain, "sine", 32);
      window.setTimeout(() => voice(52, 0.26, gain * 0.7, "sine", 30), 165);
    },
    swell(seconds = 4) {
      voice(44, seconds, 0.28, "sawtooth", 66);
      voice(88, seconds, 0.1, "sine", 132);
    },
    shimmer() {
      noise(1.6, 0.14, 5200);
      voice(1568, 1.2, 0.08, "triangle");
      window.setTimeout(() => voice(2093, 1.0, 0.05, "triangle"), 180);
    },
    tick() {
      voice(880, 0.18, 0.05, "sine");
    },
    impact() {
      voice(40, 1.8, 0.6, "sine", 24);
      noise(1.2, 0.22, 900);
    },
    close() {
      void ctx?.close().catch(() => {});
      ctx = null;
      bus = null;
      on = false;
    },
  };
}
