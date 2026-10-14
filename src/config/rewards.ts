// ============================================================
//  PLAY & WIN REWARDS — edit this file to change the rewards
//  Rewards are services and recognition, not price cuts.
//  Players who score well can send a WhatsApp message to claim.
//  You decide whether to give it, so nothing is automatic.
//  Set reward to "" to show no reward for a medal.
// ============================================================

export const REWARDS_ENABLED = true;

export type Tier = "gold" | "silver" | "bronze";

export const TIERS: Record<Tier, { label: string; stars: number; reward: string }> = {
  gold: { label: "Gold", stars: 3, reward: "A free personalised diet and workout plan from Team Bull" },
  silver: { label: "Silver", stars: 2, reward: "A free coach tip pack on WhatsApp" },
  bronze: { label: "Bronze", stars: 1, reward: "" },
};
