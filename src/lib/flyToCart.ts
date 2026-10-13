/** A little dumbbell flies from the button you pressed into the cart button. */
export function flyToCart(from: HTMLElement) {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const target = document.querySelector<HTMLElement>("[data-cart-button]");
  if (!target || !("animate" in HTMLElement.prototype)) return;

  const a = from.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const size = 34;
  const sx = a.left + a.width / 2 - size / 2;
  const sy = a.top + a.height / 2 - size / 2;
  const dx = b.left + b.width / 2 - size / 2 - sx;
  const dy = b.top + b.height / 2 - size / 2 - sy;

  const el = document.createElement("div");
  el.setAttribute("aria-hidden", "true");
  el.style.cssText = `position:fixed;left:${sx}px;top:${sy}px;width:${size}px;height:${size}px;z-index:9999;pointer-events:none;
    border-radius:9999px;background:#dc2626;color:#fff;display:flex;align-items:center;justify-content:center;
    box-shadow:0 8px 20px -6px rgba(220,38,38,.8);`;
  el.innerHTML = `<svg viewBox="0 0 40 16" width="22" height="10" fill="currentColor"><rect x="0" y="6" width="4" height="4"/><rect x="4" y="1" width="4" height="14" rx="1"/><rect x="8" y="3" width="3" height="10" rx="1"/><rect x="11" y="7" width="18" height="2"/><rect x="29" y="3" width="3" height="10" rx="1"/><rect x="32" y="1" width="4" height="14" rx="1"/><rect x="36" y="6" width="4" height="4"/></svg>`;
  document.body.appendChild(el);

  const lift = Math.min(140, Math.abs(dy) * 0.5 + 60);
  const anim = el.animate(
    [
      { transform: "translate(0,0) scale(0.6) rotate(0deg)", opacity: 0.2 },
      { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - lift}px) scale(1.15) rotate(180deg)`, opacity: 1, offset: 0.5 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.35) rotate(360deg)`, opacity: 0.4 },
    ],
    { duration: 750, easing: "cubic-bezier(0.45, 0, 0.55, 1)" }
  );
  anim.onfinish = () => el.remove();
  anim.oncancel = () => el.remove();
}
