import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { requireUser } from "@/lib/session";
import { sheetsConfigured } from "@/lib/sheets";
import { getOrdersByUser } from "@/lib/orders";
import { getProducts } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { startingPrice, isInStock } from "@/lib/products";
import { LOW_STOCK_LIMIT, RECORD_ORDERS_ON_CHECKOUT } from "@/config/features";
import ProfileForm from "@/components/auth/ProfileForm";
import LogoutButton from "@/components/auth/LogoutButton";

export const metadata: Metadata = {
  title: "My Account",
  robots: { index: false },
};

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <AccountContent />
      </Suspense>
    </div>
  );
}

async function AccountContent() {
  const me = await requireUser("/account");
  const [products, orders] = await Promise.all([
    getProducts(),
    sheetsConfigured() && RECORD_ORDERS_ON_CHECKOUT ? getOrdersByUser(me.uid).catch(() => []) : Promise.resolve([]),
  ]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-4xl font-bold uppercase">
          My <span className="text-accent">Account</span>
        </h1>
        <LogoutButton />
      </div>

      <section className="mt-6 rounded-xl border border-line bg-surface p-5">
        <p className="text-lg font-semibold text-foreground">{me.name}</p>
        <p className="text-sm text-muted">
          {me.email} · {me.phone}
        </p>
        {me.role === "admin" && (
          <Link href="/admin" className="mt-3 inline-block text-sm font-semibold text-accent hover:underline">
            Open Admin dashboard →
          </Link>
        )}
        <details className="mt-3">
          <summary className="cursor-pointer text-sm font-semibold text-accent">Edit my details</summary>
          <ProfileForm name={me.name} phone={me.phone} />
        </details>
      </section>

      {RECORD_ORDERS_ON_CHECKOUT && (
        <h2 className="mt-10 font-display text-2xl font-bold uppercase">
          Recent <span className="text-accent">orders</span>
        </h2>
      )}
      {!RECORD_ORDERS_ON_CHECKOUT ? null : orders.length === 0 ? (
        <p className="mt-3 text-muted">
          No orders yet.{" "}
          <Link href="/products" className="font-semibold text-accent hover:underline">
            Browse products
          </Link>
        </p>
      ) : (
        <div className="mt-4 divide-y divide-line rounded-xl border border-line bg-surface">
          {orders.slice(0, 20).map((o) => (
            <div key={o.orderId} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-foreground">
                  {o.orderId} · {formatPrice(o.total)}
                </p>
                <span className="rounded-full bg-accent-soft px-3 py-0.5 text-xs font-semibold text-accent-dark">
                  {o.status}
                </span>
              </div>
              <p className="mt-1 whitespace-pre-line text-sm text-muted">{o.items}</p>
              <p className="mt-1 text-xs text-muted">{o.date.slice(0, 10)}</p>
            </div>
          ))}
        </div>
      )}

      <h2 className="mt-10 font-display text-2xl font-bold uppercase">
        What’s in <span className="text-accent">stock</span>
      </h2>
      <div className="mt-4 divide-y divide-line rounded-xl border border-line bg-surface">
        {products.map((p) => {
          const inStock = isInStock(p);
          const low = inStock && p.stock !== undefined && p.stock <= LOW_STOCK_LIMIT;
          return (
            <Link
              key={p.id}
              href={`/products/${p.id}`}
              className="flex flex-wrap items-center justify-between gap-2 p-4 hover:bg-accent-soft"
            >
              <span>
                <span className="font-semibold text-foreground">{p.name}</span>
                <span className="block text-sm text-muted">
                  {p.category} · from {formatPrice(startingPrice(p))}
                </span>
              </span>
              <span className={`text-sm font-semibold ${inStock ? (low ? "text-accent" : "text-green-600") : "text-muted"}`}>
                {!inStock ? "Out of stock" : p.stock === undefined ? "In stock" : low ? `Only ${p.stock} left` : `${p.stock} in stock`}
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
