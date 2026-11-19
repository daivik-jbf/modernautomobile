/* eslint-disable @typescript-eslint/no-require-imports -- plain Node script (CommonJS) */
/**
 * Builds the picture for the site footer (the motorcycle line-drawing).
 *   assets/Modern-Automobiles-Footer-Assets/motorcycle-illustration.png  ->  2x sharpened WebP
 *   manifest: src/lib/footer-images.json      output file: public/images/footer/bike-<hash>.webp
 * The drawing sits on the same near-black as the footer (#111211), so it blends in with no visible box.
 * Output names carry a content hash, so browsers/CDNs can cache them forever and never show a stale copy.
 * Run after replacing the source:   npm run images:footer
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const SRC = path.join(__dirname, "..", "assets", "Modern-Automobiles-Footer-Assets", "motorcycle-illustration.png");
const OUT = path.join(__dirname, "..", "public", "images", "footer");
const MANIFEST = path.join(__dirname, "..", "src", "lib", "footer-images.json");

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const tmp = path.join(OUT, "bike.tmp.webp");
  const info = await sharp(SRC)
    .resize({ width: 1138, kernel: "lanczos3" }) // 2x of the 569px source
    .sharpen({ sigma: 0.9, m1: 0.6, m2: 1.2 })
    .webp({ quality: 92, effort: 5 })
    .toFile(tmp);
  const hash = crypto.createHash("md5").update(fs.readFileSync(tmp)).digest("hex").slice(0, 8);
  const file = `bike-${hash}.webp`;
  for (const old of fs.readdirSync(OUT)) if (old !== file && /^bike-[0-9a-f]{8}\.webp$/.test(old)) fs.unlinkSync(path.join(OUT, old));
  fs.renameSync(tmp, path.join(OUT, file));
  fs.writeFileSync(MANIFEST, JSON.stringify({ bike: { src: `/images/footer/${file}`, width: info.width, height: info.height } }, null, 2) + "\n");
  console.log(`bike ${info.width}x${info.height}  ${file}  ${Math.round(info.size / 1024)} KB`);
  console.log("wrote", path.relative(process.cwd(), MANIFEST));
})();
