// ============================================================
//  CHRISTMAS DECORATIONS - one switch for the whole site
// ============================================================
//
//  mode: "on"    decorations show right now, whatever the date.
//        "auto"  they show only between the dates below, then
//                disappear on their own. Nothing to remember.
//        "off"   the site is completely normal again.
//
//  Change the one word below, save, and Sync. Nothing else.

export const CHRISTMAS = {
  mode: "on" as "on" | "auto" | "off",

  /** Used only when mode is "auto". Day and month, shop's own clock. */
  from: { month: 12, day: 1 },
  until: { month: 12, day: 25 },

  /**
   * Product ids that carry the green "Christmas offer" badge.
   * Empty means no badges anywhere. Put the ids of the products you are
   * actually running an offer on, e.g. [7, 34, 77].
   */
  offerIds: [] as number[],
};

/**
 * Whether the decorations should be on screen.
 *
 * Called in the browser, never during the build: the pages are built once and
 * served for weeks, so a date read at build time would freeze on that day.
 */
export function christmasIsOn(now = new Date()) {
  if (CHRISTMAS.mode === "off") return false;
  if (CHRISTMAS.mode === "on") return true;

  const month = now.getMonth() + 1;
  const day = now.getDate();
  const started =
    month > CHRISTMAS.from.month ||
    (month === CHRISTMAS.from.month && day >= CHRISTMAS.from.day);
  const notOverYet =
    month < CHRISTMAS.until.month ||
    (month === CHRISTMAS.until.month && day <= CHRISTMAS.until.day);
  return started && notOverYet;
}

/** Whether this product should show the Christmas offer badge. */
export function hasChristmasOffer(id: number) {
  return CHRISTMAS.offerIds.includes(id);
}
