/* eslint-disable @typescript-eslint/no-require-imports -- plain Node script (CommonJS) */
/**
 * Builds the home-page hero photo.
 *   assets/home_page_image.png  ->  public/images/hero/hero-<width>-<hash>.webp  (+ src/lib/hero-images.json)
 *
 * Why: serving the 1752px PNG through the Next.js image optimizer meant a 7 MB file had to be
 * resized on the server the first time each screen size asked for it, so after every deploy the
 * first visitors waited seconds for the picture. Now every size is built here, once, and served as a
 * static, immutable, CDN-cached file. A tiny blurred preview (base64, ~300 bytes) is inlined in the
 * HTML so something photo-like is visible instantly while the real image loads.
 *
 * Steps: crop away the empty right half -> enlarge 2x (Lanczos) -> sharpen + local contrast ->
 * export 640 / 1080 / 1600 / 2260 px wide WebP variants.
 * Run after changing the source:   npm run images:hero
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const SRC = path.join(__dirname, "..", "assets", "home_page_image.png");
const OUT = path.join(__dirname, "..", "public", "images", "hero");
const MANIFEST = path.join(__dirname, "..", "src", "lib", "hero-images.json");
const CROP = { left: 0, top: 0, width: 1130, height: 897 }; // keep the left part (mechanics + bike)
const WIDTHS = [640, 1080, 1600, 2260];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });

  // master: crop, 2x enlarge, sharpen, local contrast
  const master = await sharp(SRC)
    .extract(CROP)
    .resize({ width: CROP.width * 2, kernel: "lanczos3" })
    .sharpen({ sigma: 1.0, m1: 0.7, m2: 1.4, x1: 3, y2: 8, y3: 14 })
    .sharpen({ sigma: 10, m1: 0.4, m2: 0.4 })
    .png()
    .toBuffer();
  const meta = await sharp(master).metadata();

  const variants = [];
  for (const w of WIDTHS) {
    const tmp = path.join(OUT, `hero-${w}.tmp.webp`);
    const info = await sharp(master).resize({ width: w, kernel: "lanczos3" }).webp({ quality: 80, effort: 5 }).toFile(tmp);
    const hash = crypto.createHash("md5").update(fs.readFileSync(tmp)).digest("hex").slice(0, 8);
    const name = `hero-${w}-${hash}.webp`;
    for (const old of fs.readdirSync(OUT)) if (old.startsWith(`hero-${w}-`) && old !== name) fs.unlinkSync(path.join(OUT, old));
    fs.renameSync(tmp, path.join(OUT, name));
    variants.push({ width: info.width, src: `/images/hero/${name}`, kb: Math.round(info.size / 1024) });
    console.log(`hero ${w}px -> ${name}  ${Math.round(info.size / 1024)} KB`);
  }

  // blurred inline preview
  const lq = await sharp(master).resize({ width: 28 }).webp({ quality: 45 }).toBuffer();
  const lqip = `data:image/webp;base64,${lq.toString("base64")}`;

  fs.writeFileSync(
    MANIFEST,
    JSON.stringify({ width: meta.width, height: meta.height, lqip, variants: variants.map(({ width, src }) => ({ width, src })) }, null, 2) + "\n",
  );
  console.log("wrote", path.relative(process.cwd(), MANIFEST), `(preview ${lq.length} bytes)`);
})();
