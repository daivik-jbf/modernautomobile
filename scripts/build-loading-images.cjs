/* eslint-disable @typescript-eslint/no-require-imports -- plain Node script (CommonJS) */
/**
 * Builds the pictures for the loading screen.
 *   assets/Modern-Automobiles-Loading-Screen-Assets/motorcycle.png     ->  2x sharpened WebP
 *   manifest: src/lib/loading-images.json      output files: public/images/loading/<name>-<hash>.webp
 * The picture sits on the screen's own near-black (#0c0c0d), so they blend in with no visible box.
 * Output names carry a content hash, so browsers/CDNs can cache them forever and never show a stale copy.
 * Run after replacing a source:   npm run images:loading
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const SRC = path.join(__dirname, "..", "assets", "Modern-Automobiles-Loading-Screen-Assets");
const OUT = path.join(__dirname, "..", "public", "images", "loading");
const MANIFEST = path.join(__dirname, "..", "src", "lib", "loading-images.json");

const JOBS = [
  { key: "bike", file: "motorcycle.png", width: 1160, sharpen: { sigma: 0.9, m1: 0.6, m2: 1.2 } },
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const manifest = {};
  for (const j of JOBS) {
    const tmp = path.join(OUT, `${j.key}.tmp.webp`);
    const info = await sharp(path.join(SRC, j.file))
      .resize({ width: j.width, kernel: "lanczos3" }) // 2x of the source
      .sharpen(j.sharpen)
      .webp({ quality: 92, effort: 5 })
      .toFile(tmp);
    const hash = crypto.createHash("md5").update(fs.readFileSync(tmp)).digest("hex").slice(0, 8);
    const file = `${j.key}-${hash}.webp`;
    for (const old of fs.readdirSync(OUT)) if (old !== file && new RegExp(`^${j.key}-[0-9a-f]{8}\\.webp$`).test(old)) fs.unlinkSync(path.join(OUT, old));
    fs.renameSync(tmp, path.join(OUT, file));
    manifest[j.key] = { src: `/images/loading/${file}`, width: info.width, height: info.height };
    console.log(`${j.key.padEnd(6)} ${info.width}x${info.height}  ${file}  ${Math.round(info.size / 1024)} KB`);
  }
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  console.log("wrote", path.relative(process.cwd(), MANIFEST));
})();
