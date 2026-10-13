/** White text needs this contrast ratio on a filled button (WCAG AA, normal text). */
const MIN_WHITE_CONTRAST = 4.5;

function parseHex(color: string): [number, number, number] | null {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim());
  if (!match) return null;
  const hex = match[1].length === 3 ? [...match[1]].map((c) => c + c).join("") : match[1];
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
}

function channel(value: number): number {
  const s = value / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance([r, g, b]: [number, number, number]): number {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastWithWhite(color: string): number {
  const rgb = parseHex(color);
  if (!rgb) return 21;
  return 1.05 / (luminance(rgb) + 0.05);
}

/**
 * The same hue, darkened only as far as needed for white text to stay readable.
 * Colors that already pass, and non-hex values, are returned unchanged.
 */
export function onWhiteText(color: string): string {
  const rgb = parseHex(color);
  if (!rgb || contrastWithWhite(color) >= MIN_WHITE_CONTRAST) return color;
  let factor = 1;
  let next = rgb;
  while (factor > 0 && 1.05 / (luminance(next) + 0.05) < MIN_WHITE_CONTRAST) {
    factor -= 0.02;
    next = rgb.map((c) => Math.round(c * factor)) as [number, number, number];
  }
  return `#${next.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}
