// Regenerates the app icon, Android adaptive foreground and splash mark from the
// website's own artwork, so the app and www.funberrykids.in show the same Berry.
// Uses the sharp copy that Next.js installs for the web workspace.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = new URL("../../../", import.meta.url);
const assets = new URL("../assets/", import.meta.url);
const webIcon = readFileSync(new URL("apps/web/app/icon.svg", root));
const berryMark = readFileSync(new URL("packages/brand/assets/berry-mark.svg", root));
const SKY_50 = "#eff8ff";

async function iconPng() {
  const art = await sharp(webIcon, { density: 1024 }).resize(1024, 1024).png().toBuffer();
  await sharp({ create: { width: 1024, height: 1024, channels: 4, background: SKY_50 } })
    .composite([{ input: art }])
    .flatten({ background: SKY_50 })
    .png()
    .toFile(fileURLToPath(new URL("icon.png", assets)));
}

async function centredMark(file, canvas, markHeight) {
  const mark = await sharp(berryMark, { density: 1024 }).resize({ height: markHeight }).png().toBuffer();
  await sharp({ create: { width: canvas, height: canvas, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: mark, gravity: "centre" }])
    .png()
    .toFile(fileURLToPath(new URL(file, assets)));
}

await iconPng();
// Android masks adaptive icons to the inner 66%, so the mark stays inside that circle.
await centredMark("adaptive-icon.png", 1024, 600);
await centredMark("splash-icon.png", 1024, 900);
console.log("Wrote icon.png, adaptive-icon.png and splash-icon.png");
