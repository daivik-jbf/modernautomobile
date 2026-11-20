/**
 * Content for the site footer. Links are generated from the same data as the header menus
 * (lib/services.ts, lib/plans.ts, lib/about.ts), so they never drift apart.
 * Picture: public/images/footer/bike-<hash>.webp, listed in footer-images.json — generated from
 * assets/Modern-Automobiles-Footer-Assets by `npm run images:footer`.
 */
import footerImages from "./footer-images.json";
import { CONTACT } from "./about";
import { ANNUAL_PLAN, OTHER_PLANS } from "./plans";
import { FEATURED_SERVICE, SERVICES } from "./services";

export const FOOTER_TAGLINE = "The smartest pit stop for your bike.";
export const FOOTER_BIKE = (footerImages as { bike: { src: string; width: number; height: number } }).bike;

export type FooterLink = { label: string; href: string };
export type FooterColumn = { title: string; links: FooterLink[]; more?: FooterLink };

const contactHref = CONTACT.email
  ? `mailto:${CONTACT.email}`
  : CONTACT.phone
    ? `tel:${CONTACT.phone.replace(/\s+/g, "")}`
    : "#site-footer";

const service = (slug: string) => SERVICES.find((s) => s.slug === slug);

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Bike services",
    links: [
      { label: FEATURED_SERVICE.title, href: `/book?service=${FEATURED_SERVICE.slug}` },
      { label: "Engine service", href: `/book?service=${service("engine-service")?.slug ?? "engine-service"}` },
      { label: "Brake service", href: `/book?service=${service("brake-service")?.slug ?? "brake-service"}` },
    ],
    more: { label: "View all services", href: "/#services" },
  },
  {
    title: "Maintenance plans",
    links: [...OTHER_PLANS, ANNUAL_PLAN].map((p) => ({
      label: `${p.slug === "short-term" ? "Short-term" : p.slug === "half-year" ? "Half-year" : "Annual"} plan`,
      href: `/plans/${p.slug}`,
    })),
  },
  {
    title: "Rider support",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "About us", href: "/#about" },
      { label: "Contact us", href: contactHref },
    ],
  },
];
