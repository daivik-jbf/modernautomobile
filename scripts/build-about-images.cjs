/* eslint-disable @typescript-eslint/no-require-imports -- plain Node script (CommonJS) */
/**
 * Builds the pictures for the "About us" section ("The people behind your pit stop").
 *   assets/Modern-Automobiles-About-Us-Assets/workshop-team.png  ->  responsive WebP files + blurred preview
 *   .../icons/*.png                                              ->  crisp 2x icons (transparent WebP)
 *   manifest: src/lib/about-images.json      output files: public/images/about/<name>-<hash>.webp
 *
 * - team photo: 965x476 source, enlarged 2x (Lanczos) + sharpened so it stays crisp on high-density screens,
 *   exported at 960 / 1930 px wide (picked by the browser via a custom loader) with an inline blurred preview
 * - icons: enlarged 2x, edges re-sharpened (transparent background kept)
 * Output names carry a content hash, so browsers/CDNs can cache them forever and never show a stale copy.
 * Run after changing any of the sources:   npm run images:about
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const SRC = path.join(__dirname, "..", "assets", "Modern-Automobiles-About-Us-Assets");
const OUT = path.join(__dirname, "..", "public", "images", "about");
const MANIFEST = path.join(__dirname, "..", "src", "lib", "about-images.json");

const hashName = (name, tmp) => {
  const hash = crypto.createHash("md5").update(fs.readFileSync(tmp)).digest("hex").slice(0, 8);
  const out = `${name}-${hash}.webp`;
  for (const old of fs.readdirSync(OUT)) {
    if (old !== out && old.startsWith(`${name}-`) && /^[0-9a-f]{8}\.webp$/.test(old.slice(name.length + 1))) fs.unlinkSync(path.join(OUT, old));
  }
  fs.renameSync(tmp, path.join(OUT, out));
  return out;
};

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const manifest = { team: {}, icons: {} };

  // ---- team photo ----
  const master = await sharp(path.join(SRC, "workshop-team.png"))
    .resize({ width: 1930, kernel: "lanczos3" })
    .sharpen({ sigma: 1.0, m1: 0.7, m2: 1.4, x1: 3, y2: 8, y3: 14 })
    .modulate({ saturation: 1.03 })
    .png()
    .toBuffer();
  const mMeta = await sharp(master).metadata();
  manifest.team.width = mMeta.width;
  manifest.team.height = mMeta.height;
  manifest.team.variants = [];
  for (const w of [960, 1930]) {
    const tmp = path.join(OUT, `team-${w}.tmp.webp`);
    const info = await sharp(master).resize({ width: w, kernel: "lanczos3" }).webp({ quality: 82, effort: 5 }).toFile(tmp);
    const file = hashName(`team-${w}`, tmp);
    manifest.team.variants.push({ width: w, src: `/images/about/${file}` });
    console.log(`team ${w}px  ${file}  ${Math.round(info.size / 1024)} KB`);
  }
  const lq = await sharp(master).resize({ width: 24 }).webp({ quality: 45 }).toBuffer();
  manifest.team.lqip = `data:image/webp;base64,${lq.toString("base64")}`;

  // ---- icons (transparent) ----
  for (const f of fs.readdirSync(path.join(SRC, "icons")).filter((x) => /\.png$/i.test(x)).sort()) {
    const name = f.replace(/\.png$/i, "");
    const tmp = path.join(OUT, `${name}.tmp.webp`);
    const info = await sharp(path.join(SRC, "icons", f))
      .resize({ width: 164, kernel: "lanczos3" })
      .sharpen({ sigma: 0.6, m1: 0.5, m2: 1.0 })
      .webp({ quality: 95, alphaQuality: 100, effort: 5 })
      .toFile(tmp);
    const file = hashName(name, tmp);
    manifest.icons[name] = { src: `/images/about/${file}`, width: info.width, height: info.height };
    console.log(`icon ${name.padEnd(18)} ${info.width}x${info.height}  ${Math.round(info.size / 1024)} KB`);
  }

  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  console.log("wrote", path.relative(process.cwd(), MANIFEST));
})();
