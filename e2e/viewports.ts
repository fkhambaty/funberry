export const VIEWPORTS = [
  { name: "390x667", width: 390, height: 667 },
  { name: "390x844", width: 390, height: 844 },
  { name: "393x852", width: 393, height: 852 },
  { name: "768x1024", width: 768, height: 1024 },
  { name: "820x1180", width: 820, height: 1180 },
  { name: "1024x768", width: 1024, height: 768 },
  { name: "1440x900", width: 1440, height: 900 },
] as const;

export type ViewportName = (typeof VIEWPORTS)[number]["name"];

/** Phone, tablet, and desktop sizes that exercise touch, not only overflow. */
export const TOUCH_VIEWPORTS = new Set<ViewportName>(["390x844", "768x1024", "1024x768", "1440x900"]);
