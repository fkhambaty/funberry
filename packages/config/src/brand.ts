/**
 * Central brand configuration. Change the name here and it propagates everywhere.
 */
export const brand = {
  name: "FunBerry",
  tagline: "Learn through play — fun games for curious little minds!",
  website: "https://funberry.app",
  supportEmail: "hello@funberry.app",
} as const;

export type Brand = typeof brand;
