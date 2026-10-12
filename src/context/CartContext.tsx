"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, Product } from "@/types";
import { priceFor } from "@/lib/products";

export type AddOptions = { flavour?: string; size?: string };

type CartContextType = {
  drawerOpen: boolean; // is the sliding cart panel open?
  lastAdded: string | null; // name of the product just added (for the green banner)
  openDrawer: () => void;
  closeDrawer: () => void;
  items: CartItem[];
  count: number;
  total: number;
  ready: boolean; // true once the saved cart has been loaded
  add: (product: Product, options?: AddOptions) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextType | null>(null);
const STORAGE_KEY = "tfh-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  const openDrawer = useCallback(() => {
    setLastAdded(null);
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setLastAdded(null);
  }, []);

  // Load the saved cart when the site opens
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: CartItem[] = JSON.parse(saved);
        // older saved carts had no `key`
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setItems(parsed.map((i) => ({ ...i, key: i.key ?? String(i.id) })));
      }
    } catch {
      // ignore broken saved data
    }
    setReady(true);
  }, []);

  // Save the cart whenever it changes
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage may be blocked; the cart still works for this visit
    }
  }, [items, ready]);

  const add = (p: Product, options: AddOptions = {}) => {
    const sizeLabel = p.sizes?.length
      ? (p.sizes.find((x) => x.label === options.size) ?? p.sizes[0]).label
      : undefined;
    const price = priceFor(p, sizeLabel);
    const variant =
      [options.flavour, sizeLabel].filter(Boolean).join(" · ") || undefined;
    const key = `${p.id}|${options.flavour ?? ""}|${sizeLabel ?? ""}`;

    setLastAdded(variant ? `${p.name} (${variant})` : p.name);
    setDrawerOpen(true);
    setItems((prev) => {
      const found = prev.find((i) => i.key === key);
      if (found) {
        return prev.map((i) => (i.key === key ? { ...i, qty: i.qty + 1 } : i));
      }
      return [
        ...prev,
        { key, id: p.id, name: p.name, variant, price, qty: 1, image: p.image },
      ];
    });
  };

  const setQty = (key: string, qty: number) =>
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.key !== key)
        : prev.map((i) => (i.key === key ? { ...i, qty } : i))
    );

  const remove = (key: string) =>
    setItems((prev) => prev.filter((i) => i.key !== key));

  const clear = () => setItems([]);

  const count = items.reduce((sum, i) => sum + i.qty, 0);
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        total,
        ready,
        drawerOpen,
        lastAdded,
        openDrawer,
        closeDrawer,
        add,
        setQty,
        remove,
        clear,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
