/**
 * Service catalogue shown on the home page (#services).
 * Images live in /public/images/services (source files: assets/bike_service_images).
 * Later this will come from the database so admins can edit services & pricing.
 */

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
  image: { src: "/images/services/general-service.png", width: 1100, height: 275 },
} as const;

export const SERVICES: Service[] = [
  {
    slug: "oil-filter-change",
    title: ["Oil &", "Filter change"],
    image: { src: "/images/services/oil-filter.png", width: 186, height: 126 },
  },
  {
    slug: "brake-service",
    title: ["Brake", "Service"],
    image: { src: "/images/services/brake-service.png", width: 247, height: 126 },
  },
  {
    slug: "chain-sprocket",
    title: ["Chain &", "Sprocket"],
    image: { src: "/images/services/chain-sprocket.png", width: 232, height: 126 },
  },
  {
    slug: "tyres-wheels",
    title: ["Tyres &", "Wheels"],
    image: { src: "/images/services/tyres-wheels.png", width: 239, height: 126 },
  },
  {
    slug: "battery-electrical",
    title: ["Battery &", "Electrical"],
    image: { src: "/images/services/battery-electrical.png", width: 232, height: 126 },
  },
  {
    slug: "engine-service",
    title: ["Engine", "Service"],
    image: { src: "/images/services/engine-service.png", width: 225, height: 128 },
  },
  {
    slug: "suspension-service",
    title: ["Suspension", "Service"],
    image: { src: "/images/services/suspension-service.png", width: 225, height: 126 },
  },
  {
    slug: "wash-detailing",
    title: ["Wash &", "Detailing"],
    image: { src: "/images/services/bike-wash.png", width: 250, height: 128 },
  },
];
