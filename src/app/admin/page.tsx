import { Suspense } from "react";
import type { Metadata } from "next";
import { LOW_STOCK_LIMIT, RECORD_ORDERS_ON_CHECKOUT } from "@/config/features";
import { sheetsConfigured } from "@/lib/sheets";
import { getAdminProducts } from "@/lib/catalog";
import { getAllOrders, ORDER_STATUSES } from "@/lib/orders";
import { countUsers } from "@/lib/users";
import { requireAdmin } from "@/lib/session";
import { formatPrice } from "@/lib/format";
import { startingPrice } from "@/lib/products";
import {
  adjustStockAction,
  importSamplesAction,
  orderStatusAction,
  toggleActiveAction,
} from "@/app/actions/admin";
import ProductStudio from "@/components/admin/ProductStudio";
import AddProductPanel from "@/components/admin/AddProductPanel";
import LogoutButton from "@/components/auth/LogoutButton";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false },
};

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <AdminContent />
      </Suspense>
    </div>
  );
}

function Tile({
  label,
  value,
  warn,
}: {
  label: string;
  value: number;
  warn?: boolean;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="text-sm text-muted">{label}</p>
      <p
        className={`mt-1 font-display text-3xl font-bold ${warn && value > 0 ? "text-accent" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

const smallBtn =
  "rounded-md border border-line bg-white px-2.5 py-1 text-sm font-semibold text-foreground hover:border-accent hover:text-accent";

async function AdminContent() {
  const me = await requireAdmin();

  if (!sheetsConfigured()) {
    return (
      <>
        <h1 className="font-display text-4xl font-bold uppercase">
          Admin <span className="text-accent">Dashboard</span>
        </h1>
        <p className="mt-4 rounded-xl border border-line bg-accent-soft p-4 text-accent-dark">
          Google Sheet is not connected yet. Add the Google keys (see README →
          “Accounts &amp; stock setup”) and reload.
        </p>
      </>
    );
  }

  const [products, orders, customers] = await Promise.all([
    getAdminProducts(),
    RECORD_ORDERS_ON_CHECKOUT ? getAllOrders() : Promise.resolve([]),
    countUsers(),
  ]);

  const outOfStock = products.filter(
    (p) => p.stock !== undefined && p.stock <= 0,
  ).length;
  const lowStock = products.filter(
    (p) => p.stock !== undefined && p.stock > 0 && p.stock <= LOW_STOCK_LIMIT,
  ).length;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-4xl font-bold uppercase">
          Admin <span className="text-accent">Dashboard</span>
        </h1>
        <div className="flex items-center gap-3 text-sm text-muted">
          <span>{me.email}</span>
          <LogoutButton />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        <Tile label="Products" value={products.length} />
        <Tile label="Out of stock" value={outOfStock} warn />
        <Tile
          label={`Low stock (≤ ${LOW_STOCK_LIMIT})`}
          value={lowStock}
          warn
        />
        <Tile label="Customers" value={customers} />
        {RECORD_ORDERS_ON_CHECKOUT && (
          <Tile label="Orders" value={orders.length} />
        )}
      </div>

      {/* ---------- products & stock ---------- */}
      <h2 className="mt-12 font-display text-2xl font-bold uppercase">
        Products &amp; <span className="text-accent">stock</span>
      </h2>

      {products.length === 0 ? (
        <div className="mt-4 rounded-xl border border-line bg-surface p-5">
          <p className="text-muted">
            Your Products tab is empty. Load the sample products to start, or
            add your own below.
          </p>
          <form action={importSamplesAction} className="mt-3">
            <button className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90">
              Load sample products
            </button>
          </form>
        </div>
      ) : (
        <div className="mt-4 divide-y divide-line rounded-xl border border-line bg-surface">
          {products.map((p) => {
            const low = p.stock !== undefined && p.stock <= LOW_STOCK_LIMIT;
            return (
              <div key={p.id} className="p-4">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  <div className="min-w-0 flex-1 basis-56">
                    <p className="font-semibold text-foreground">
                      {p.name}{" "}
                      {!p.active && (
                        <span className="ml-1 rounded bg-line px-2 py-0.5 text-xs text-muted">
                          Hidden
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-muted">
                      {p.category} · from {formatPrice(startingPrice(p))}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <form action={adjustStockAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="delta" value={-1} />
                      <button
                        className={smallBtn}
                        aria-label={`Remove 1 from ${p.name}`}
                      >
                        −1
                      </button>
                    </form>
                    <span
                      className={`min-w-16 text-center text-sm font-semibold ${low ? "text-accent" : "text-foreground"}`}
                    >
                      {p.stock === undefined
                        ? "not tracked"
                        : p.stock === 0
                          ? "Out of stock"
                          : `${p.stock} in stock`}
                    </span>
                    <form action={adjustStockAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="delta" value={1} />
                      <button
                        className={smallBtn}
                        aria-label={`Add 1 to ${p.name}`}
                      >
                        +1
                      </button>
                    </form>
                    <form action={adjustStockAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="delta" value={10} />
                      <button
                        className={smallBtn}
                        aria-label={`Add 10 to ${p.name}`}
                      >
                        +10
                      </button>
                    </form>
                  </div>

                  <form action={toggleActiveAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <button className={smallBtn}>
                      {p.active ? "Hide" : "Show"}
                    </button>
                  </form>
                </div>

                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-semibold text-accent">
                    Edit details
                  </summary>
                  <div className="mt-3 rounded-lg border border-line bg-white p-4">
                    <ProductStudio initial={p} />
                  </div>
                </details>
              </div>
            );
          })}
        </div>
      )}

      <AddProductPanel startOpen={products.length === 0} />

      {RECORD_ORDERS_ON_CHECKOUT && (
        <>
          {/* ---------- orders ---------- */}
          <h2 className="mt-12 font-display text-2xl font-bold uppercase">
            Customer <span className="text-accent">orders</span>
          </h2>
          {orders.length === 0 ? (
            <p className="mt-3 text-muted">
              No orders yet. They appear here when a customer taps “Checkout on
              WhatsApp”.
            </p>
          ) : (
            <div className="mt-4 divide-y divide-line rounded-xl border border-line bg-surface">
              {orders.slice(0, 50).map((o) => (
                <div
                  key={o.orderId}
                  className="flex flex-wrap items-start gap-x-6 gap-y-3 p-4"
                >
                  <div className="min-w-0 flex-1 basis-64">
                    <p className="font-semibold text-foreground">
                      {o.orderId} · {formatPrice(o.total)}
                    </p>
                    <p className="text-sm text-muted">
                      {o.name} · {o.phone} · {o.email}
                    </p>
                    <p className="mt-1 whitespace-pre-line text-sm text-foreground">
                      {o.items}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {o.date.slice(0, 16).replace("T", " ")} UTC
                    </p>
                  </div>
                  <form
                    action={orderStatusAction}
                    className="flex items-center gap-2"
                  >
                    <input type="hidden" name="orderId" value={o.orderId} />
                    <select
                      name="status"
                      defaultValue={o.status}
                      className="rounded-lg border border-line bg-white px-2 py-1.5 text-sm text-foreground"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                    <button className={smallBtn}>Update</button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
