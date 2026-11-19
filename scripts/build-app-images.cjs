/* eslint-disable @typescript-eslint/no-require-imports -- plain Node script (CommonJS) */
/**
 * Builds the pictures for the "Your bike service, in your pocket" (mobile app) section.
 *   assets/Modern-Automobiles-App-Promo-Assets/phone-and-workshop.png  ->  responsive WebP files + blurred preview
 *   .../icons/*.png                                                    ->  crisp 2x icons (transparent WebP)
 *   .../badges/*.png                                                   ->  cleaned, sharpened 2x store badges
 *   manifest: src/lib/app-images.json      output files: public/images/app/<name>-<hash>.webp
 *
 * - phone photo: 796x941 source, enlarged 2x (Lanczos) + sharpened so it stays crisp on high-density screens,
 *   exported at 828 / 1592 px wide (picked by the browser via a custom loader) with an inline blurred preview
 * - icons: enlarged 2x, edges re-sharpened (transparent background kept)
 * - badges: the previews have a slightly noisy dark background; levels are pulled down so it is a clean black
 * Output names carry a content hash, so browsers/CDNs can cache them forever and never show a stale copy.
 * Run after changing any of the sources:   npm run images:app
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const SRC = path.join(__dirname, "..", "assets", "Modern-Automobiles-App-Promo-Assets");
const OUT = path.join(__dirname, "..", "public", "images", "app");
const MANIFEST = path.join(__dirname, "..", "src", "lib", "app-images.json");

const hashName = (name, file, tmp) => {
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
  const manifest = { phone: {}, icons: {}, badges: {} };

  // ---- phone photo ----
  const master = await sharp(path.join(SRC, "phone-and-workshop.png"))
    .resize({ width: 1592, kernel: "lanczos3" })
    .sharpen({ sigma: 1.0, m1: 0.7, m2: 1.4, x1: 3, y2: 8, y3: 14 })
    .modulate({ saturation: 1.04 })
    .png()
    .toBuffer();
  const mMeta = await sharp(master).metadata();
  manifest.phone.width = mMeta.width;
  manifest.phone.height = mMeta.height;
  manifest.phone.variants = [];
  for (const w of [828, 1592]) {
    const tmp = path.join(OUT, `phone-${w}.tmp.webp`);
    const info = await sharp(master).resize({ width: w, kernel: "lanczos3" }).webp({ quality: 82, effort: 5 }).toFile(tmp);
    const file = hashName(`phone-${w}`, null, tmp);
    manifest.phone.variants.push({ width: w, src: `/images/app/${file}` });
    console.log(`phone ${w}px  ${file}  ${Math.round(info.size / 1024)} KB`);
  }
  const lq = await sharp(master).resize({ width: 24 }).webp({ quality: 45 }).toBuffer();
  manifest.phone.lqip = `data:image/webp;base64,${lq.toString("base64")}`;

  // ---- icons (transparent) ----
  for (const f of fs.readdirSync(path.join(SRC, "icons")).filter((x) => /\.png$/i.test(x)).sort()) {
    const name = f.replace(/\.png$/i, "");
    const tmp = path.join(OUT, `${name}.tmp.webp`);
    const info = await sharp(path.join(SRC, "icons", f))
      .resize({ width: 164, kernel: "lanczos3" })
      .sharpen({ sigma: 0.6, m1: 0.5, m2: 1.0 })
      .webp({ quality: 95, alphaQuality: 100, effort: 5 })
      .toFile(tmp);
    const file = hashName(name, null, tmp);
    manifest.icons[name] = { src: `/images/app/${file}`, width: info.width, height: info.height };
    console.log(`icon ${name.padEnd(24)} ${info.width}x${info.height}  ${Math.round(info.size / 1024)} KB`);
  }

  // ---- store badges ----
  for (const f of fs.readdirSync(path.join(SRC, "badges")).filter((x) => /\.png$/i.test(x)).sort()) {
    const name = f.replace(/-preview\.png$/i, "").replace(/\.png$/i, "");
    const tmp = path.join(OUT, `${name}.tmp.webp`);
    const info = await sharp(path.join(SRC, "badges", f))
      .resize({ width: 678, kernel: "lanczos3" })
      .linear(1.18, -22) // pull the noisy dark background down to clean black, keep the white text/border
      .sharpen({ sigma: 0.8, m1: 0.8, m2: 1.6 })
      .webp({ quality: 90, effort: 5 })
      .toFile(tmp);
    const file = hashName(name, null, tmp);
    manifest.badges[name] = { src: `/images/app/${file}`, width: info.width, height: info.height };
    console.log(`badge ${name.padEnd(23)} ${info.width}x${info.height}  ${Math.round(info.size / 1024)} KB`);
  }

  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  console.log("wrote", path.relative(process.cwd(), MANIFEST));
})();
