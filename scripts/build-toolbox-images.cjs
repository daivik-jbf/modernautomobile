/* eslint-disable @typescript-eslint/no-require-imports -- plain Node script (CommonJS) */
/**
 * Builds the pictures for the rider-login toolbox (src/components/toolbox-login.tsx).
 *   assets/Modern-Automobiles-Toolbox/assets/cabinet.png       ->  stage-<hash>.webp   (cleaned + cropped)
 *   assets/Modern-Automobiles-Toolbox/assets/closed-front.png  ->  front-<hash>.webp
 *   assets/Modern-Automobiles-Toolbox/assets/open-tray.png     ->  tray-<hash>.webp    (transparent)
 *   manifest: src/lib/toolbox-images.json      output files: public/images/toolbox/<name>-<hash>.webp
 *
 * The supplied cabinet.png is a full 1672x941 mock-up page: it has a desktop header and the "RIDER LOGIN"
 * title painted in. The live page has its own header and heading, so the stage keeps only the workshop
 * (x 440..1672, y 80..941 of the original = STAGE_X / STAGE_Y below). The art also has two duplicated slabs of
 * background beside the cabinet (where the open tray used to be pasted); they are repaired here by mirroring the
 * clean background next to them. Coordinates of the other layers (design space 1672x941):
 *   closed-front 808x380 at (604, 322)      open-tray 1050x386 at (482, 318)
 * which in stage space (minus STAGE_X / STAGE_Y) is (164, 242) and (42, 238) — see src/lib/toolbox.ts.
 * Output names carry a content hash, so browsers/CDNs can cache them forever and never show a stale copy.
 * Run after replacing a source:   npm run images:toolbox
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const SRC = path.join(__dirname, "..", "assets", "Modern-Automobiles-Toolbox", "assets");
const OUT = path.join(__dirname, "..", "public", "images", "toolbox");
const MANIFEST = path.join(__dirname, "..", "src", "lib", "toolbox-images.json");

const STAGE_X = 440;
const STAGE_Y = 80;

function finish(key, tmp, info) {
  const hash = crypto.createHash("md5").update(fs.readFileSync(tmp)).digest("hex").slice(0, 8);
  const file = `${key}-${hash}.webp`;
  for (const old of fs.readdirSync(OUT)) if (old !== file && new RegExp(`^${key}-[0-9a-f]{8}\\.webp$`).test(old)) fs.unlinkSync(path.join(OUT, old));
  fs.renameSync(tmp, path.join(OUT, file));
  console.log(`${key.padEnd(6)} ${info.width}x${info.height}  ${file}  ${Math.round(info.size / 1024)} KB`);
  return { src: `/images/toolbox/${file}`, width: info.width, height: info.height };
}

/** repaint a rectangle of `buf` (RGB, width w) by mirroring the clean columns next to it; soft top/bottom edges */
function mirrorPatch(buf, w, ch, { x0, x1, y0, y1, from, ramp = 3, rampBottom = 3 }) {
  for (let y = y0; y < y1; y++) {
    const a = Math.min(1, (y - y0 + 1) / ramp, (y1 - y) / rampBottom);
    for (let x = x0; x < x1; x++) {
      const sx = from(x);
      for (let c = 0; c < 3; c++) {
        const o = (y * w + x) * ch + c;
        const s = buf[(y * w + sx) * ch + c];
        buf[o] = Math.round(buf[o] * (1 - a) + s * a);
      }
    }
  }
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const manifest = { crop: { x: STAGE_X, y: STAGE_Y } };

  // ---- stage: cabinet.png, repaired and cropped ----
  const { data, info } = await sharp(path.join(SRC, "cabinet.png")).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, channels: C } = info;
  // left slab x482..550: mirror the clean background just left of it (x431..481)
  mirrorPatch(data, W, C, { x0: 482, x1: 550, y0: 323, y1: 703, from: (x) => { const m = (x - 482) % 102; return 481 - (m < 51 ? m : 101 - m); } });
  // right slab x1466..1532: mirror the clean background just right of it (x1532..)
  mirrorPatch(data, W, C, { x0: 1466, x1: 1532, y0: 292, y1: 704, ramp: 30, rampBottom: 3, from: (x) => 1532 + (1531 - x) });
  const stageTmp = path.join(OUT, "stage.tmp.webp");
  const stageInfo = await sharp(data, { raw: { width: W, height: info.height, channels: C } })
    .extract({ left: STAGE_X, top: STAGE_Y, width: W - STAGE_X, height: info.height - STAGE_Y })
    .webp({ quality: 90, effort: 5 })
    .toFile(stageTmp);
  manifest.stage = finish("stage", stageTmp, stageInfo);

  // ---- drawer front ----
  const frontTmp = path.join(OUT, "front.tmp.webp");
  // shown 808 stage-px wide (about 800 css px on a laptop), so 2x of that is plenty; any aspect ratio ~2.13:1 works
  manifest.front = finish(
    "front",
    frontTmp,
    await sharp(path.join(SRC, "closed-front.png")).resize({ width: 1616, kernel: "lanczos3" }).webp({ quality: 90, effort: 5 }).toFile(frontTmp),
  );

  // ---- open tray (transparent) ----
  const trayTmp = path.join(OUT, "tray.tmp.webp");
  manifest.tray = finish("tray", trayTmp, await sharp(path.join(SRC, "open-tray.png")).webp({ quality: 92, alphaQuality: 100, effort: 5 }).toFile(trayTmp));

  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  console.log("wrote", path.relative(process.cwd(), MANIFEST));
})();
