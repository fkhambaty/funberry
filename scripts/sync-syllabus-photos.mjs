#!/usr/bin/env node
/**
 * Copies textbook syllabus JPGs into the web app for local / deploy bundling.
 * Default source: ~/Downloads/Photos-3-001 2
 *
 * Usage:
 *   node scripts/sync-syllabus-photos.mjs
 *   SRC="/path/to/Photos folder" node scripts/sync-syllabus-photos.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const destDir = path.join(root, "apps/web/public/syllabus-photos");
const srcDir =
  process.env.SRC ||
  path.join(process.env.HOME || "", "Downloads", "Photos-3-001 2");

if (!fs.existsSync(srcDir)) {
  console.error("Source folder not found:", srcDir);
  console.error("Set SRC=/full/path/to/Photos-3-001\\ 2");
  process.exit(1);
}

fs.mkdirSync(destDir, { recursive: true });
const files = fs.readdirSync(srcDir).filter((f) => /\.jpe?g$/i.test(f));
let n = 0;
for (const f of files) {
  fs.copyFileSync(path.join(srcDir, f), path.join(destDir, f));
  n++;
}
console.log(`Copied ${n} images to ${destDir}`);
