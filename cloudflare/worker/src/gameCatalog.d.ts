export function gameEntitlement(
  gameId: string,
  totalStars: number,
  premium: boolean,
): { allowed: boolean; reason: "allowed" | "locked" | "unknown"; zone?: string };
