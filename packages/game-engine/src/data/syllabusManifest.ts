import { zones } from "@funberry/config";

/**
 * Index of syllabus photos (NEP / ICSE-style science Grade I–II) from Photos-3-001.
 * Run `node scripts/sync-syllabus-photos.mjs` to copy JPGs into `apps/web/public/syllabus-photos/`.
 * Games reference these paths as `/syllabus-photos/<filename>`.
 */
export const SYLLABUS_PHOTO_FILES = [
  "20260328_104630.jpg",
  "20260328_104634.jpg",
  "20260328_104636.jpg",
  "20260328_104641.jpg",
  "20260328_104643.jpg",
  "20260328_104651.jpg",
  "20260328_104652.jpg",
  "20260328_104656.jpg",
  "20260328_104658.jpg",
  "20260328_104701.jpg",
  "20260328_104703.jpg",
  "20260328_104706.jpg",
  "20260328_104707.jpg",
  "20260328_104722.jpg",
  "20260328_104725.jpg",
  "20260328_104727.jpg",
  "20260328_104730.jpg",
  "20260328_104733.jpg",
  "20260328_104736.jpg",
  "20260328_104740.jpg",
  "20260328_104744.jpg",
  "20260328_104747.jpg",
  "20260328_104750.jpg",
  "20260328_104753.jpg",
  "20260328_104757.jpg",
  "20260328_104800.jpg",
  "20260328_104803.jpg",
  "20260328_104806.jpg",
  "20260328_104809.jpg",
  "20260328_104811.jpg",
  "20260328_104814.jpg",
  "20260328_104816.jpg",
  "20260328_104819.jpg",
  "20260328_104821.jpg",
  "20260328_104824.jpg",
  "20260328_104827.jpg",
  "20260328_104829.jpg",
  "20260328_104832.jpg",
  "20260328_104835.jpg",
  "20260328_104838.jpg",
  "20260328_104841.jpg",
  "20260328_104844.jpg",
  "20260328_104847.jpg",
  "20260328_104851.jpg",
  "20260328_104853.jpg",
  "20260328_104855.jpg",
  "20260328_104858.jpg",
  "20260328_104900.jpg",
  "20260328_104903.jpg",
  "20260328_104905.jpg",
  "20260328_104907.jpg",
  "20260328_104910.jpg",
  "20260328_104912.jpg",
  "20260328_104915.jpg",
  "20260328_104917.jpg",
  "20260328_104920.jpg",
  "20260328_104922.jpg",
  "20260328_104924.jpg",
  "20260328_104927.jpg",
  "20260328_104930.jpg",
  "20260328_104933.jpg",
  "20260328_104935.jpg",
  "20260328_104937.jpg",
  "20260328_104940.jpg",
] as const;

export type SyllabusPhotoFile = (typeof SYLLABUS_PHOTO_FILES)[number];

export type SyllabusZoneId = (typeof zones)[number]["id"];

export function syllabusPhotoUrl(name: SyllabusPhotoFile): string {
  return `/syllabus-photos/${name}`;
}

/** Strong matches from sampled textbook spreads; extend as you tag more pages. */
const SYLLABUS_PHOTO_OVERRIDES: Partial<
  Record<SyllabusPhotoFile, { zoneId: SyllabusZoneId; note: string }>
> = {
  "20260328_104630.jpg": {
    zoneId: "plants",
    note: "NEP Foundational Stage / learning-by-doing overview",
  },
  "20260328_104740.jpg": {
    zoneId: "animals",
    note: "Chapter 3 — Animals that help us (incl. Word Smart)",
  },
  "20260328_104900.jpg": {
    zoneId: "air",
    note: "Air, wind, directions, pollution notes",
  },
  "20260328_104940.jpg": {
    zoneId: "others-in-my-world",
    note: "SAFAL / rocks & minerals worksheet",
  },
};

/**
 * Suggested play zone + note for each photo. Unknown files rotate across EVS zones
 * so every image has a default home for future `bookPageSrc` wiring.
 */
export function getSyllabusPhotoRouting(file: SyllabusPhotoFile): {
  zoneId: SyllabusZoneId;
  note: string;
} {
  const o = SYLLABUS_PHOTO_OVERRIDES[file];
  if (o) return o;
  const idx = SYLLABUS_PHOTO_FILES.indexOf(file);
  const z = zones[idx % zones.length]!;
  return {
    zoneId: z.id,
    note: `Science Grade I–II syllabus photo ${idx + 1}/${SYLLABUS_PHOTO_FILES.length} — set bookPageSrc on a game in “${z.evsTheme}”`,
  };
}

/** Full table for tooling / dashboards (64 rows). */
export const SYLLABUS_PHOTO_LINKS = SYLLABUS_PHOTO_FILES.map((file) => ({
  file,
  ...getSyllabusPhotoRouting(file),
}));
