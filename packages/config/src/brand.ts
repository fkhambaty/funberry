/**
 * Central brand configuration. Change the name here and it propagates everywhere.
 */
export const brand = {
  name: "FunBerry Kids",
  tagline: "Learn through play — fun games for curious little minds!",
  website: "https://funberrykids.in",
  supportEmail: "hello@funberrykids.in",
} as const;

export type Brand = typeof brand;
