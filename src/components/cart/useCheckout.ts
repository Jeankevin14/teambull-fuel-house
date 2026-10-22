"use client";

import { useRouter } from "next/navigation";
import { logOrderAction } from "@/app/actions/auth";
import { RECORD_ORDERS_ON_CHECKOUT, REQUIRE_LOGIN_TO_CHECKOUT } from "@/config/features";
import { useUser } from "@/context/UserContext";
import { buildOrderUrl } from "@/lib/whatsapp";
import type { CartItem } from "@/types";

/** Shared by the cart drawer and the cart page. */
export function useCheckout(onLoginNeeded?: () => void) {
  const router = useRouter();
  const { user, ready } = useUser();

  const needsLogin = REQUIRE_LOGIN_TO_CHECKOUT && ready && !user;
  const label = needsLogin ? "Log in to checkout" : "Checkout on WhatsApp";

  const checkout = (items: CartItem[], total: number) => {
    if (REQUIRE_LOGIN_TO_CHECKOUT && !user) {
      onLoginNeeded?.();
      router.push("/login?next=%2Fcart");
      return;
    }
    // open WhatsApp first (must happen straight after the click), then save the order
    window.open(buildOrderUrl(items, total, user), "_blank", "noopener,noreferrer");
    if (user && RECORD_ORDERS_ON_CHECKOUT) {
      void logOrderAction(
        items.map((i) => ({ id: i.id, name: i.name, variant: i.variant, qty: i.qty, price: i.price }))
      );
    }
  };

  return { checkout, label };
}
