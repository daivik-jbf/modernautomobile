/* eslint-disable @typescript-eslint/no-require-imports -- plain Node script (CommonJS) */
/**
 * Builds the "How it works" step photos for the website.
 *   assets/how_modernautomobiles_images/*.png  ->  public/images/how/step-1..5.webp
 *
 * The processing adapts to the size of the source photo:
 *  - LARGE sources (>= 1100px wide, e.g. 1536x1024 from an AI image tool): only a gentle touch —
 *    slight enlargement (max 2000px) with light sharpening and a small colour/contrast lift.
 *  - SMALL sources (< 1100px, shown ~1100px wide in the big panel => enlarged ~2.5x). To keep that as
 *    crisp as possible each photo goes through:
 *   1. light de-noise            – removes the soft artefacts of the original
 *   2. enlarge in two stages     – Lanczos ×1.6, sharpen, Lanczos to the final size, sharpen again
 *   3. contrast + colour restore – the originals look flat/dull once enlarged
 *   4. fine film grain           – gives the eye texture to latch onto, so enlarged areas look
 *                                  sharp instead of smeared
 * Output files are named step-N-<hash>.webp (hash of the content) and listed in src/lib/how-images.json,
 * so a changed photo always gets a new URL and no browser or CDN can keep showing an old copy.
 * Genuinely better results need larger source photos (1600px+ wide): drop them into
 * assets/how_modernautomobiles_images (keep the 01-… 05-… names) and run:   npm run images:how
 */
const sharp = require("sharp");
const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

const SRC = path.join(__dirname, "..", "assets", "how_modernautomobiles_images");
const OUT = path.join(__dirname, "..", "public", "images", "how");
const MANIFEST = path.join(__dirname, "..", "src", "lib", "how-images.json");
const MAX_W = 2400; // never needed larger than this on screen

/** small seeded PRNG so the same photo always produces the same bytes (stable file names) */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** low-amplitude monochrome grain centred on mid-grey (neutral under `overlay` blending) */
function grain(width, height, amp, seed) {
  const rand = mulberry32(seed);
  const buf = Buffer.alloc(width * height * 3);
  for (let i = 0; i < width * height; i++) {
    // sum of two uniforms ≈ triangular distribution (softer than pure uniform noise)
    const v = 128 + Math.round((rand() + rand() - 1) * amp);
    buf[i * 3] = buf[i * 3 + 1] = buf[i * 3 + 2] = v;
  }
  return buf;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const files = fs.readdirSync(SRC).filter((f) => /^\d\d-.*\.(png|jpe?g|webp)$/i.test(f)).sort();
  if (files.length === 0) throw new Error(`No images found in ${SRC}`);

  const manifest = {};
  for (const f of files) {
    const n = parseInt(f.slice(0, 2), 10);
    const input = path.join(SRC, f);
    const meta = await sharp(input).metadata();
    const large = meta.width >= 1100;
    let buf;
    let grainAmp;
    const webpQuality = large ? 82 : 88; // sharp photos compress well at 82 with no visible loss
    if (large) {
      // good source: keep it natural — mild enlargement, light sharpening, small colour/contrast lift
      buf = await sharp(input)
        .resize({ width: Math.min(Math.round(meta.width * 1.3), 2000), kernel: "lanczos3" })
        .sharpen({ sigma: 0.9, m1: 0.6, m2: 1.4, x1: 3, y2: 8, y3: 16 })
        .modulate({ saturation: 1.05 })
        .linear(1.03, -3)
        .toBuffer();
      grainAmp = 0; // sharp source: no grain needed (also keeps the files small)
    } else {
      const finalW = Math.min(meta.width * 3, MAX_W);
      // 1–2: de-noise, then two-stage enlargement with sharpening in between
      buf = await sharp(input)
        .median(1)
        .resize({ width: Math.round(meta.width * 1.6), kernel: "lanczos3" })
        .sharpen({ sigma: 0.9, m1: 0.8, m2: 1.8, x1: 3, y2: 10, y3: 20 })
        .toBuffer();
      buf = await sharp(buf)
        .resize({ width: finalW, kernel: "lanczos3" })
        .sharpen({ sigma: 1.4, m1: 1.0, m2: 2.4, x1: 3, y2: 12, y3: 26 })
        // 3: local contrast ("clarity") + a lift in contrast/colour
        .sharpen({ sigma: 10, m1: 0.4, m2: 0.4 })
        .modulate({ saturation: 1.16, brightness: 1.03 })
        .linear(1.08, -8)
        .toBuffer();
      grainAmp = 13;
    }

    // 4: fine film grain
    const { width, height } = await sharp(buf).metadata();
    const noise = grainAmp
      ? await sharp(grain(width, height, grainAmp, 1000 + n), { raw: { width, height, channels: 3 } }).png().toBuffer()
      : null;
    const tmp = path.join(OUT, `step-${n}.tmp.webp`);
    const info = await sharp(buf)
      .composite(noise ? [{ input: noise, blend: "overlay" }] : [])
      .webp({ quality: webpQuality, effort: 5 })
      .toFile(tmp);

    // content-hashed name -> a changed photo always gets a brand-new URL (no stale browser cache)
    const hash = crypto.createHash("md5").update(fs.readFileSync(tmp)).digest("hex").slice(0, 8);
    const name = `step-${n}-${hash}.webp`;
    for (const old of fs.readdirSync(OUT)) {
      if (old.startsWith(`step-${n}-`) || old === `step-${n}.webp`) fs.unlinkSync(path.join(OUT, old));
    }
    fs.renameSync(tmp, path.join(OUT, name));
    manifest[n] = { src: `/images/how/${name}`, width: info.width, height: info.height };

    console.log(`${f}  ${meta.width}x${meta.height}  ->  ${name}  ${info.width}x${info.height}  ${Math.round(info.size / 1024)} KB`);
  }
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  console.log("wrote", path.relative(process.cwd(), MANIFEST));
})();
