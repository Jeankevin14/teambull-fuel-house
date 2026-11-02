const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/**
 * Scene 8 — how buying works here: pick your packs, they land in the cart, and
 * checkout opens WhatsApp with the order already written out. Real products and
 * real prices, shown as a cart rather than as photographs. This is a picture of
 * the flow, so nothing can be ordered from the film.
 */
export default function ShoppingShowcase({
  items,
}: {
  items: { name: string; price: number }[];
}) {
  const picked = items.slice(0, 3);
  const total = picked.reduce((n, p) => n + p.price, 0);

  return (
    <div className="tb-scene">
      <p className="tb-eyebrow">Shopping</p>
      <h2 className="tb-head" style={{ fontSize: "clamp(1.5rem,5vw,3rem)" }}>
        Pick it. <em>Send it.</em>
      </h2>

      <div className="tb-cart">
        {picked.map((p, i) => (
          <div key={p.name} className="tb-row" style={{ animationDelay: `${0.5 + i * 0.5}s` }}>
            <b>{p.name}</b>
            <span className="tb-price">{rupees(p.price)}</span>
          </div>
        ))}
        <div className="tb-total" style={{ animationDelay: "2.1s" }}>
          <span>Total</span>
          <span>{rupees(total)}</span>
        </div>
      </div>

      <span className="tb-wa" style={{ animationDelay: "2.5s" }}>
        Checkout on WhatsApp
      </span>
      <p className="tb-sub" style={{ animationDelay: "2.9s", fontSize: "0.82rem", opacity: 0.65 }}>
        Your cart arrives as a ready-made message. No card, no checkout form.
      </p>
    </div>
  );
}
