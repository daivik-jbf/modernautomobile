/* eslint-disable @typescript-eslint/no-require-imports -- plain Node script (CommonJS) */
/**
 * Builds the service, maintenance-plan and menu-thumbnail pictures.
 *   assets/bike_service_images/*.png   ->  public/images/services/<name>-<hash>.webp
 *   assets/maintenace_plans/*.png      ->  public/images/plans/<name>-<hash>.webp
 *   (+ menu thumbnails cropped from the same photos)
 *   manifest: src/lib/site-images.json   { "services/oil-filter": { src, width, height }, ... }
 *
 * Why: these used to be PNGs resized by the Next.js image optimizer on demand, which makes the first
 * visitors after every deploy wait while ~25 pictures are processed. Now they are small static WebP
 * files (a few KB to ~60 KB), content-hashed so they can be cached forever.
 * Run after replacing any of the source pictures:   npm run images:site
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.join(__dirname, "..");
const MANIFEST = path.join(ROOT, "src", "lib", "site-images.json");

/** [key, source file, crop (optional), output size for crops (optional), webp quality] */
const JOBS = [];
const add = (key, src, extra = {}) => JOBS.push({ key, src, quality: 86, ...extra });

// service tiles + featured banner (the screenshot "bike-services-page.png" is a design reference, not used)
for (const f of fs.readdirSync(path.join(ROOT, "assets", "bike_service_images"))) {
  if (!/\.png$/i.test(f) || /bike-services-page/.test(f)) continue;
  add(`services/${f.replace(/\.png$/i, "")}`, `assets/bike_service_images/${f}`);
}
// maintenance plans
for (const f of fs.readdirSync(path.join(ROOT, "assets", "maintenace_plans"))) {
  if (!/\.png$/i.test(f)) continue;
  add(`plans/${f.replace(/\.png$/i, "")}`, `assets/maintenace_plans/${f}`);
}
// menu thumbnails (2x of the on-screen size, framed on the subject)
add("services/general-service-thumb", "assets/bike_service_images/general-service.png", { crop: { left: 470, top: 30, width: 460, height: 245 }, out: [176, 96], quality: 88 });
add("plans/short-term-thumb", "assets/maintenace_plans/short-term-maintenance.png", { crop: { left: 300, top: 0, width: 470, height: 250 }, out: [168, 104], quality: 88 });
add("plans/half-year-thumb", "assets/maintenace_plans/half-year-maintenance.png", { crop: { left: 230, top: 0, width: 440, height: 277 }, out: [168, 104], quality: 88 });
add("plans/annual-thumb", "assets/maintenace_plans/annual-maintenance.png", { crop: { left: 40, top: 40, width: 700, height: 440 }, out: [168, 104], quality: 88 });

(async () => {
  const manifest = {};
  for (const job of JOBS) {
    const [dir, name] = job.key.split("/");
    const outDir = path.join(ROOT, "public", "images", dir);
    fs.mkdirSync(outDir, { recursive: true });
    const input = path.join(ROOT, job.src);
    const meta = await sharp(input).metadata();
    let pipe = sharp(input);
    if (job.crop) {
      // keep the crop's aspect equal to the output aspect so nothing is stretched
      const [ow, oh] = job.out;
      const aspect = ow / oh;
      let { left, top, width, height } = job.crop;
      if (width / height > aspect) {
        const nw = Math.round(height * aspect);
        left += Math.round((width - nw) / 2);
        width = nw;
      } else {
        const nh = Math.round(width / aspect);
        top += Math.round((height - nh) / 2);
        height = nh;
      }
      width = Math.min(width, meta.width - left);
      height = Math.min(height, meta.height - top);
      pipe = pipe.extract({ left, top, width, height }).resize(ow, oh, { kernel: "lanczos3" }).sharpen({ sigma: 0.7, m1: 0.6, m2: 1.2 });
    }
    const tmp = path.join(outDir, `${name}.tmp.webp`);
    const info = await pipe.webp({ quality: job.quality, effort: 5 }).toFile(tmp);
    const hash = crypto.createHash("md5").update(fs.readFileSync(tmp)).digest("hex").slice(0, 8);
    const file = `${name}-${hash}.webp`;
    for (const old of fs.readdirSync(outDir)) {
      if (old === file) continue;
      // remove older builds of this picture and the legacy un-hashed PNG/WebP
      if (old.startsWith(`${name}-`) && /^[0-9a-f]{8}\.webp$/.test(old.slice(name.length + 1))) fs.unlinkSync(path.join(outDir, old));
      if (old === `${name}.png`) fs.unlinkSync(path.join(outDir, old));
    }
    fs.renameSync(tmp, path.join(outDir, file));
    manifest[job.key] = { src: `/images/${dir}/${file}`, width: info.width, height: info.height };
    console.log(`${job.key.padEnd(34)} ${info.width}x${info.height}  ${String(Math.round(info.size / 1024)).padStart(3)} KB`);
  }
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  console.log("wrote", path.relative(process.cwd(), MANIFEST));
})();
