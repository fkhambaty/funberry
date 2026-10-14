import { colors, type ZoneConfig } from "@funberry/config";

export { colors };

/** Kid controls never go below 48; primary kid actions use 64 (same as web --tap-min / --tap-kid). */
export const tap = { min: 48, kid: 64 } as const;

export const radius = { sm: 12, md: 18, lg: 24, pill: 999 } as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const type = {
  hero: { fontSize: 34, fontWeight: "900" as const, color: colors.sky[900] },
  title: { fontSize: 24, fontWeight: "800" as const, color: colors.ink[900] },
  heading: { fontSize: 18, fontWeight: "800" as const, color: colors.ink[900] },
  body: { fontSize: 16, fontWeight: "600" as const, color: colors.ink[700] },
  small: { fontSize: 14, fontWeight: "600" as const, color: colors.ink[500] },
  kid: { fontSize: 20, fontWeight: "800" as const, color: colors.ink[900] },
} as const;

export type Tone = ZoneConfig["colorKey"];

export function toneColors(tone: Tone) {
  const ramp = colors[tone];
  return { soft: ramp[50], tint: ramp[100], border: ramp[300], solid: ramp[500], deep: ramp[700] };
}

export const surfaces = {
  parent: colors.paper,
  kid: colors.sky[50],
  card: colors.white,
} as const;
