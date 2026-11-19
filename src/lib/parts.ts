/**
 * Brands shown in the "Parts & oils we use" carousel (home page, #parts).
 * Logos: public/images/parts/<slug>-<hash>.webp, listed in parts-images.json — both generated from
 * assets/parts_oil_images by `npm run images:parts` (run it after adding/replacing a logo).
 */
import partsImages from "./parts-images.json";

export type Brand = {
  slug: string;
  name: string;
  image: { src: string; width: number; height: number };
};

const images = partsImages as Record<string, { src: string; width: number; height: number }>;

/** Order around the ring (first = left-most). `initial` is the one in front on load. */
const ORDER: [slug: string, name: string][] = [
  ["hero-motocorp", "Hero MotoCorp"],
  ["bajaj-auto", "Bajaj Auto"],
  ["royal-enfield", "Royal Enfield"],
  ["yamaha-genuine-parts", "Yamaha Genuine Parts"],
  ["castrol", "Castrol"],
  ["motul", "Motul"],
  ["gulf", "Gulf"],
  ["yamalube", "Yamalube"],
  ["tvs-motor", "TVS Motor"],
  ["honda-genuine-parts", "Honda Genuine Parts"],
  ["hero-genuine-parts", "Hero Genuine Parts"],
  ["bajaj-genuine-parts", "Bajaj Genuine Parts"],
];

export const BRANDS: Brand[] = ORDER.filter(([slug]) => images[slug]).map(([slug, name]) => ({
  slug,
  name,
  image: images[slug],
}));

export const INITIAL_BRAND = 2; // Royal Enfield in front
export const PARTS_TITLE = "Parts & oils we use";
