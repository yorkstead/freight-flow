import sharp from "sharp";
import { readFile, writeFile, mkdir } from "node:fs/promises";

await mkdir("public/icons", { recursive: true });
const mark = await readFile("public/brand/freightflow-mark.svg");
for (const size of [32, 192, 512]) {
  await sharp(mark).resize(size, size).png().toFile(`public/icons/icon-${size}.png`);
}
await sharp(mark).resize(180, 180).flatten({ background: "#22d3ee" }).png().toFile("public/icons/apple-touch-icon.png");
// The complete glyph fits inside the central 80% diameter mask-safe circle.
await sharp({ create: { width: 512, height: 512, channels: 4, background: "#22d3ee" } })
  .composite([{ input: await sharp(mark).resize(384, 384).png().toBuffer(), left: 64, top: 64 }])
  .png().toFile("public/icons/maskable-512.png");
const lockup = `<svg xmlns="http://www.w3.org/2000/svg" width="660" height="112" viewBox="0 0 660 112"><rect width="660" height="112" rx="16" fill="#0b0e12"/><svg x="16" y="16" width="80" height="80" viewBox="0 0 64 64">${mark.toString().replace(/^.*?<svg[^>]*>/s, "").replace(/<\/svg>\s*$/, "")}</svg><text x="120" y="59" fill="#f8fafc" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="40" letter-spacing="2">FREIGHTFLOW</text><text x="122" y="84" fill="#94a3b8" font-family="Arial,Helvetica,sans-serif" font-size="13" letter-spacing="5">CONTROL TOWER</text></svg>`;
await writeFile("public/brand/freightflow-logo.svg", lockup);
await sharp(Buffer.from(lockup)).resize(1320, 224).png().toFile("public/brand/freightflow-logo.png");
console.log("Generated FreightFlow logo and five app icon exports.");
