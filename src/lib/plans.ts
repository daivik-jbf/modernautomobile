/**
 * Maintenance plans shown on the home page (#plans).
 * Images: public/images/plans/<name>-<hash>.webp, listed in site-images.json — both generated from
 * assets/maintenace_plans by `npm run images:site` (run it after replacing a picture).
 * Later this will come from the database so admins can edit plans and pricing.
 */

import siteImages from "./site-images.json";

const img = (key: string) => (siteImages as Record<string, { src: string; width: number; height: number }>)[key];

export type Plan = {
  slug: string;
  /** Display lines, e.g. ["Short-term", "Maintenance"] */
  title: string[];
  duration: string;
  cta: string;
  image: { src: string; width: number; height: number };
};

export const ANNUAL_PLAN: Plan = {
  slug: "annual",
  title: ["Annual Maintenance"],
  duration: "12 months",
  cta: "View annual plan",
  image: img("plans/annual-maintenance"),
};

export const OTHER_PLANS: Plan[] = [
  {
    slug: "short-term",
    title: ["Short-term", "Maintenance"],
    duration: "3 months",
    cta: "View plan",
    image: img("plans/short-term-maintenance"),
  },
  {
    slug: "half-year",
    title: ["Half-year", "Maintenance"],
    duration: "6 months",
    cta: "View plan",
    image: img("plans/half-year-maintenance"),
  },
];
