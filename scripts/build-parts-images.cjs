/* eslint-disable @typescript-eslint/no-require-imports -- plain Node script (CommonJS) */
/**
 * Builds the brand logos for the "Parts & oils we use" carousel.
 *   assets/parts_oil_images/*.png  ->  public/images/parts/<slug>-<hash>.webp  (+ src/lib/parts-images.json)
 *
 * The supplied logos are full-colour on a white background; the site shows them on dark tiles:
 *   mono  – single-colour logos become clean WHITE silhouettes (alpha = darkness of the original)
 *   color – multi-colour logos (Castrol, Gulf, Motul) keep their colours; the white background is
 *           removed (only the part connected to the border, so white lettering inside survives)
 *           and a thin white outline is added so they stand out on dark
 * Both are enlarged 3x and then "re-edged" (alpha contrast curve) so edges are crisp like vectors.
 * Every logo is centred in the same canvas (same aspect as a tile) at a consistent visual size.
 *
 * Replace/add logos in assets/parts_oil_images, then run:   npm run images:parts
 * (Output names contain a content hash, so browsers can never show a stale logo.)
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const SRC = path.join(__dirname, "..", "assets", "parts_oil_images");
const OUT = path.join(__dirname, "..", "public", "images", "parts");
const MANIFEST = path.join(__dirname, "..", "src", "lib", "parts-images.json");

/** logos that keep their own colours (everything else becomes a white silhouette) */
const COLOR = new Set(["castrol", "gulf", "motul"]);

const SCALE = 3; // enlargement factor before re-edging
const CW = 1086; // output canvas (matches the tile aspect ≈ 1 : 0.84)
const CH = 912;
const FIT_W = 0.74; // logo fits inside 74% of canvas width …
const FIT_H = 0.6; // … and 60% of its height

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** grow a 0..255 alpha plane by r px (separable max filter) */
function dilate(alpha, w, h, r) {
  const tmp = new Uint8Array(alpha.length);
  const out = new Uint8Array(alpha.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let m = 0;
      for (let k = -r; k <= r; k++) {
        const xx = x + k;
        if (xx >= 0 && xx < w) m = Math.max(m, alpha[y * w + xx]);
      }
      tmp[y * w + x] = m;
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let m = 0;
      for (let k = -r; k <= r; k++) {
        const yy = y + k;
        if (yy >= 0 && yy < h) m = Math.max(m, tmp[yy * w + x]);
      }
      out[y * w + x] = m;
    }
  }
  return out;
}

async function processLogo(file, slug) {
  const mode = COLOR.has(slug) ? "color" : "mono";
  const { data, info } = await sharp(path.join(SRC, file))
    .removeAlpha()
    .resize({ width: 362 * SCALE, kernel: "lanczos3" })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const n = w * h;
  const rgba = Buffer.alloc(n * 4);

  if (mode === "mono") {
    for (let i = 0; i < n; i++) {
      const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const a = smoothstep(0.1, 0.6, (255 - lum) / 255); // dark/coloured ink -> opaque
      rgba[i * 4] = rgba[i * 4 + 1] = rgba[i * 4 + 2] = 255;
      rgba[i * 4 + 3] = Math.round(a * 255);
    }
  } else {
    // 1) background = near-white pixels connected to the image border
    const nearWhite = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      nearWhite[i] = Math.min(data[i * 3], data[i * 3 + 1], data[i * 3 + 2]) > 226 ? 1 : 0;
    }
    const bg = new Uint8Array(n);
    const stack = [];
    const push = (x, y) => {
      const i = y * w + x;
      if (nearWhite[i] && !bg[i]) {
        bg[i] = 1;
        stack.push(i);
      }
    };
    for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
    for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
    while (stack.length) {
      const i = stack.pop();
      const x = i % w, y = (i / w) | 0;
      if (x > 0) push(x - 1, y);
      if (x < w - 1) push(x + 1, y);
      if (y > 0) push(x, y - 1);
      if (y < h - 1) push(x, y + 1);
    }
    // 2) logo alpha (soft edge from how close to white a boundary pixel is)
    const alpha = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      if (bg[i]) { alpha[i] = 0; continue; }
      alpha[i] = 255;
    }
    // 3) white outline around the logo (also swallows the pale anti-aliasing fringe)
    const outline = dilate(alpha, w, h, 4 * SCALE);
    for (let i = 0; i < n; i++) {
      const la = alpha[i] / 255;
      const oa = outline[i] / 255;
      // logo over a white outline
      const outA = la + oa * (1 - la);
      const r = la * data[i * 3] + (1 - la) * oa * 255;
      const g = la * data[i * 3 + 1] + (1 - la) * oa * 255;
      const b = la * data[i * 3 + 2] + (1 - la) * oa * 255;
      rgba[i * 4] = outA ? Math.round(r / outA) : 0;
      rgba[i * 4 + 1] = outA ? Math.round(g / outA) : 0;
      rgba[i * 4 + 2] = outA ? Math.round(b / outA) : 0;
      rgba[i * 4 + 3] = Math.round(outA * 255);
    }
    // re-edge: a slight blur then a steep curve gives smooth, vector-like outline edges
    const blurred = await sharp(rgba, { raw: { width: w, height: h, channels: 4 } }).blur(1.6).raw().toBuffer();
    for (let i = 0; i < n; i++) {
      const a = blurred[i * 4 + 3] / 255;
      rgba[i * 4 + 3] = Math.round(smoothstep(0.35, 0.65, a) * 255);
    }
  }

  // trim transparent margins, fit into a common canvas, centre
  const trimmed = await sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 8 })
    .toBuffer({ resolveWithObject: true });
  const scale = Math.min((CW * FIT_W) / trimmed.info.width, (CH * FIT_H) / trimmed.info.height);
  const lw = Math.round(trimmed.info.width * scale);
  const lh = Math.round(trimmed.info.height * scale);
  const logo = await sharp(trimmed.data, { raw: { width: trimmed.info.width, height: trimmed.info.height, channels: trimmed.info.channels } })
    .resize(lw, lh, { kernel: "lanczos3" })
    .png()
    .toBuffer();

  const tmp = path.join(OUT, `${slug}.tmp.webp`);
  const info2 = await sharp({ create: { width: CW, height: CH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: logo, left: Math.round((CW - lw) / 2), top: Math.round((CH - lh) / 2) }])
    .webp({ quality: 92, alphaQuality: 100, effort: 5 })
    .toFile(tmp);

  const hash = crypto.createHash("md5").update(fs.readFileSync(tmp)).digest("hex").slice(0, 8);
  const name = `${slug}-${hash}.webp`;
  for (const old of fs.readdirSync(OUT)) if (old.startsWith(`${slug}-`) && old !== name) fs.unlinkSync(path.join(OUT, old));
  fs.renameSync(tmp, path.join(OUT, name));
  console.log(`${file.padEnd(28)} ${mode.padEnd(5)} -> ${name}  ${Math.round(info2.size / 1024)} KB`);
  return { src: `/images/parts/${name}`, width: info2.width, height: info2.height };
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const files = fs.readdirSync(SRC).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).sort();
  if (files.length === 0) throw new Error(`No logos found in ${SRC}`);
  const manifest = {};
  for (const f of files) {
    const slug = f.replace(/\.[^.]+$/, "");
    manifest[slug] = await processLogo(f, slug);
  }
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  console.log("wrote", path.relative(process.cwd(), MANIFEST));
})();
