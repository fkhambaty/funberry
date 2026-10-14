import { brand } from "@funberry/config";
import { normalizeWebOrigin } from "@funberry/game-engine/src/embed/bridge";

/** Expo inlines EXPO_PUBLIC_* at bundle time. Both default to production. */
const configuredWeb = process.env.EXPO_PUBLIC_FUNBERRY_WEB || "https://www.funberrykids.in";

export const WEB_ORIGIN = normalizeWebOrigin(configuredWeb) ?? "https://www.funberrykids.in";

export const links = {
  website: WEB_ORIGIN,
  privacy: `${WEB_ORIGIN}/privacy`,
  terms: `${WEB_ORIGIN}/terms`,
  refunds: `${WEB_ORIGIN}/refunds`,
  support: `mailto:${brand.supportEmail}`,
} as const;
