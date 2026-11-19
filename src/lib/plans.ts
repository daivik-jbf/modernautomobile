/**
 * Maintenance plans shown on the home page (#plans).
 * Images live in /public/images/plans (source files: assets/maintenace_plans).
 * Later this will come from the database so admins can edit plans and pricing.
 */

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
  image: { src: "/images/plans/annual-maintenance.png", width: 820, height: 554 },
};

export const OTHER_PLANS: Plan[] = [
  {
    slug: "short-term",
    title: ["Short-term", "Maintenance"],
    duration: "3 months",
    cta: "View plan",
    image: { src: "/images/plans/short-term-maintenance.png", width: 770, height: 250 },
  },
  {
    slug: "half-year",
    title: ["Half-year", "Maintenance"],
    duration: "6 months",
    cta: "View plan",
    image: { src: "/images/plans/half-year-maintenance.png", width: 770, height: 277 },
  },
];
