export const pricing = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    period: null,
    features: [
      "3 Learning Zones",
      "2 Games per Zone",
      "Basic Progress Tracking",
      "1 Child Profile",
    ],
    maxChildren: 1,
    maxFreeGamesPerZone: 2,
  },
  premiumMonthly: {
    id: "premium_monthly",
    name: "Premium Monthly",
    price: 4.99,
    period: "month" as const,
    stripeProductId: "prod_funberrykids_monthly",
    stripePriceId: "price_funberrykids_monthly",
    revenueCatProductId: "funberrykids_premium_monthly",
    features: [
      "All 15 Learning Zones",
      "All Games Unlocked",
      "Detailed Progress Reports",
      "Up to 4 Child Profiles",
      "No Ads",
      "Offline Mode",
    ],
    maxChildren: 4,
    maxFreeGamesPerZone: Infinity,
  },
  premiumYearly: {
    id: "premium_yearly",
    name: "Premium Yearly",
    price: 39.99,
    period: "year" as const,
    stripeProductId: "prod_funberrykids_yearly",
    stripePriceId: "price_funberrykids_yearly",
    revenueCatProductId: "funberrykids_premium_yearly",
    features: [
      "All 15 Learning Zones",
      "All Games Unlocked",
      "Detailed Progress Reports",
      "Up to 4 Child Profiles",
      "No Ads",
      "Offline Mode",
      "Save 33%!",
    ],
    maxChildren: 4,
    maxFreeGamesPerZone: Infinity,
  },
} as const;

export type PricingTier = keyof typeof pricing;
export type SubscriptionTier = "free" | "premium_monthly" | "premium_yearly" | "lifetime";

export function isPremium(tier: SubscriptionTier): boolean {
  return tier === "premium_monthly" || tier === "premium_yearly" || tier === "lifetime";
}
