export function formatPrice(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}
