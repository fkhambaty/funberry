import { colors } from "@funberry/config";

/** Berry is the village guide. Child avatars are chosen separately and are not this mascot. */
export const mascot = {
  name: "Berry",
  role: "superhero guide",
  note: "Cape, mask, and a chest star. Berry talks to kids. A child's avatar stays their own.",
  webAsset: "/brand/berry-mark.svg",
  expoAsset: "assets/berry-mark.svg",
} as const;

export const voice = {
  empty: "Berry is waiting. A grown-up can add a player, then the games open.",
  celebrate: "Berry cheers. You finished this round.",
  timer: "Berry is holding the cape. Ask a grown-up for the code.",
  guide: "You can continue the last game, or pick a new one.",
} as const;

export type BerryMoment = keyof typeof voice;

export function voiceLine(moment: BerryMoment): string {
  return voice[moment];
}

export const checkoutCopy = {
  merchantName: "FKTech",
  provides: "FKTech provides FunBerry Kids Premium",
  description(priceLabel: string) {
    return `FKTech provides FunBerry Kids Premium — ${priceLabel}`;
  },
} as const;

export { colors };

export const nativeDeliveryGate = {
  primarySurface: "responsive web",
  d7Retention: "At least 25% of new parent accounts return with a child play on day 7.",
  freeToPaid: "At least 3% of verified free accounts start a paid week or month within 30 days.",
  rule: "The Expo app can play games, but the website stays the primary surface. Do not market the app as the way children play, and do not submit it to a store, until both targets are measured on production. The targets are gates, not a claim that they have been met.",
} as const;

export const merchantBrandingGate = {
  current: "Checkout shows FKTech because its EdTech Razorpay account serves FunBerry Kids and Data For Dummies.",
  rule: "Ask for a dedicated FunBerry merchant name only if parents still abandon checkout after the FKTech sentence is visible, and the drop-off is measured.",
} as const;
