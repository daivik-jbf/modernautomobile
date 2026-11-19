/**
 * Service catalogue shown on the home page (#services).
 * Images: public/images/services/<name>-<hash>.webp, listed in site-images.json — both generated from
 * assets/bike_service_images by `npm run images:site` (run it after replacing a picture).
 * Later this will come from the database so admins can edit services & pricing.
 */

import siteImages from "./site-images.json";

const img = (key: string) => (siteImages as Record<string, ServiceImage>)[key];

export type ServiceImage = { src: string; width: number; height: number };

export type Service = {
  slug: string;
  /** Title split into display lines, e.g. ["Oil &", "Filter change"] */
  title: string[];
  image: ServiceImage;
};

export const FEATURED_SERVICE = {
  slug: "general-service",
  title: "General service",
  blurb: "Book a pickup or drop-off. We inspect your bike and send a quote for your approval.",
  cta: "Book an inspection",
  image: img("services/general-service"),
};

export const SERVICES: Service[] = [
  {
    slug: "oil-filter-change",
    title: ["Oil &", "Filter change"],
    image: img("services/oil-filter"),
  },
  {
    slug: "brake-service",
    title: ["Brake", "Service"],
    image: img("services/brake-service"),
  },
  {
    slug: "chain-sprocket",
    title: ["Chain &", "Sprocket"],
    image: img("services/chain-sprocket"),
  },
  {
    slug: "tyres-wheels",
    title: ["Tyres &", "Wheels"],
    image: img("services/tyres-wheels"),
  },
  {
    slug: "battery-electrical",
    title: ["Battery &", "Electrical"],
    image: img("services/battery-electrical"),
  },
  {
    slug: "engine-service",
    title: ["Engine", "Service"],
    image: img("services/engine-service"),
  },
  {
    slug: "suspension-service",
    title: ["Suspension", "Service"],
    image: img("services/suspension-service"),
  },
  {
    slug: "wash-detailing",
    title: ["Wash &", "Detailing"],
    image: img("services/bike-wash"),
  },
];
