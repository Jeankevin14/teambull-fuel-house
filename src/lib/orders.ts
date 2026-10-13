// Orders, stored in the "Orders" tab of your Google Sheet.
import { appendRow, readTab, updateRow } from "@/lib/sheets";

export const ORDER_STATUSES = ["New", "Confirmed", "Delivered", "Cancelled"] as const;

export type OrderRecord = {
  row: number;
  orderId: string;
  date: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  items: string;
  total: number;
  status: string;
};

function toOrder(r: Record<string, string> & { _row: number }): OrderRecord {
  return {
    row: r._row,
    orderId: r.orderId ?? "",
    date: r.date ?? "",
    userId: r.userId ?? "",
    name: r.name ?? "",
    email: r.email ?? "",
    phone: r.phone ?? "",
    items: r.items ?? "",
    total: Number(String(r.total ?? "").replace(/[₹,\s]/g, "")) || 0,
    status: r.status || "New",
  };
}

export async function addOrder(o: {
  userId: string;
  name: string;
  email: string;
  phone: string;
  items: string;
  total: number;
}) {
  const orderId = `TFH-${Date.now().toString(36).toUpperCase()}`;
  await appendRow("Orders", {
    orderId,
    date: new Date().toISOString(),
    userId: o.userId,
    name: o.name,
    email: o.email,
    phone: o.phone,
    items: o.items,
    total: o.total,
    status: "New",
  });
  return orderId;
}

export async function getAllOrders(): Promise<OrderRecord[]> {
  const rows = await readTab("Orders");
  return rows.map(toOrder).reverse(); // newest first
}

export async function getOrdersByUser(userId: string): Promise<OrderRecord[]> {
  return (await getAllOrders()).filter((o) => o.userId === userId);
}

export async function setOrderStatus(orderId: string, status: string) {
  const rows = await readTab("Orders");
  const hit = rows.find((r) => r.orderId === orderId);
  if (!hit) throw new Error("Order not found.");
  await updateRow("Orders", hit._row, { ...hit, status });
}
