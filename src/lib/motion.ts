/** Small click effects: a ripple on the button and a red/black/white confetti burst. */

const COLORS = ["#dc2626", "#ff5a4a", "#171717", "#ffffff", "#f5b301"];

function reduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ripple(e: React.MouseEvent<HTMLElement>) {
  if (reduced()) return;
  const b = e.currentTarget;
  const r = b.getBoundingClientRect();
  const d = Math.max(r.width, r.height);
  const s = document.createElement("span");
  s.className = "ripple-dot";
  s.style.width = s.style.height = `${d}px`;
  s.style.left = `${e.clientX - r.left - d / 2}px`;
  s.style.top = `${e.clientY - r.top - d / 2}px`;
  b.appendChild(s);
  setTimeout(() => s.remove(), 650);
}

export function confetti(x: number, y: number) {
  if (reduced() || typeof document.body.animate !== "function") return;
  for (let i = 0; i < 42; i++) {
    const p = document.createElement("i");
    p.style.cssText = `position:fixed;z-index:200;left:${x}px;top:${y}px;width:8px;height:12px;pointer-events:none;background:${COLORS[i % COLORS.length]};border:1px solid #0002;`;
    document.body.appendChild(p);
    const a = Math.random() * Math.PI * 2;
    const v = 70 + Math.random() * 130;
    const dx = Math.cos(a) * v;
    const dy = Math.sin(a) * v - 60;
    p.animate(
      [
        { transform: "translate(0,0) rotate(0)", opacity: 1 },
        { transform: `translate(${dx}px,${dy}px) rotate(${Math.random() * 720}deg)`, opacity: 1, offset: 0.6 },
        { transform: `translate(${dx * 1.1}px,${dy + 160}px) rotate(900deg)`, opacity: 0 },
      ],
      { duration: 1100 + Math.random() * 500, easing: "cubic-bezier(.2,.7,.4,1)" },
    ).onfinish = () => p.remove();
  }
}

/** A big rubber stamp "ADDED TO CART" slams onto the product picture. */
export function stampAdded(from: HTMLElement) {
  const scope = from.closest<HTMLElement>("[data-stamp-scope]");
  const box = scope?.querySelector<HTMLElement>("[data-stamp-box]");
  if (!box) return;
  box.querySelector(".stamp-layer")?.remove();

  const layer = document.createElement("div");
  layer.className = "stamp-layer";
  layer.setAttribute("aria-hidden", "true");
  layer.innerHTML =
    '<div class="stamp"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg><span>Added<br/>to cart</span></div>';
  box.appendChild(layer);
  setTimeout(() => layer.remove(), 1900);
}
