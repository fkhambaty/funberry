export const pricing = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    period: null,
    features: [
      "3 EVS worlds plus Computer Lab",
      "All Computer Lab games",
      "A few games in other worlds",
      "Basic Progress Tracking",
      "1 Child Profile",
    ],
    maxChildren: 1,
    maxFreeGamesPerZone: 2,
  },
  /** INR auto-renew via Razorpay (FunBerryKids web). */
  premiumWeeklyInr: {
    id: "premium_weekly",
    name: "Premium Weekly",
    priceInr: 99,
    period: "week" as const,
    razorpayEnvPlanKey: "RAZORPAY_PLAN_WEEKLY_ID" as const,
    features: [
      "All learning zones",
      "All games unlocked",
      "Detailed reports",
      "Auto-renews weekly",
    ],
    maxChildren: 4,
    maxFreeGamesPerZone: Infinity,
  },
  premiumMonthlyInr: {
    id: "premium_monthly",
    name: "Premium Monthly",
    priceInr: 349,
    period: "month" as const,
    razorpayEnvPlanKey: "RAZORPAY_PLAN_MONTHLY_ID" as const,
    features: [
      "All learning zones",
      "All games unlocked",
      "Detailed reports",
      "Auto-renews monthly",
    ],
    maxChildren: 4,
    maxFreeGamesPerZone: Infinity,
  },
} as const;

/** Parent-facing names for stored tiers. `premium_yearly` is a legacy value with no live plan. */
export const tierLabels: Record<SubscriptionTier, string> = {
  free: "Free",
  premium_weekly: "Premium Weekly",
  premium_monthly: "Premium Monthly",
  premium_yearly: "Premium (legacy yearly)",
  lifetime: "Lifetime access",
};

export type PricingTier = keyof typeof pricing;
export type SubscriptionTier =
  | "free"
  | "premium_weekly"
  | "premium_monthly"
  | "premium_yearly"
  | "lifetime";

export function isPremium(tier: SubscriptionTier): boolean {
  return (
    tier === "premium_weekly" ||
    tier === "premium_monthly" ||
    tier === "premium_yearly" ||
    tier === "lifetime"
  );
}
