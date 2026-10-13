// ============================================================
//  SWITCHES — turn features on/off here
// ============================================================

// true  = customers must log in before "Checkout on WhatsApp"
// false = anyone can check out, login is optional
export const REQUIRE_LOGIN_TO_CHECKOUT = true;

// Products with this many units (or fewer) get a "low stock" warning in Admin
export const LOW_STOCK_LIMIT = 5;

// false = tapping "Checkout on WhatsApp" only opens WhatsApp. Nothing is saved
//         and no "order / purchased" record appears anywhere on the site.
// true  = each checkout is also saved in the Orders tab (shown in Admin + My account)
export const RECORD_ORDERS_ON_CHECKOUT = false;
