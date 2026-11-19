import { ANNUAL_PLAN, OTHER_PLANS } from "./plans";
import { FEATURED_SERVICE, SERVICES } from "./services";

export type MenuItem = {
  label: string;
  href: string;
  /** small secondary line, e.g. "3 months" */
  sub?: string;
  image: { src: string; position?: string };
};

export type NavMenu = {
  title: string;
  columns: 1 | 2;
  items: MenuItem[];
  viewAll: { label: string; href: string };
};

export type NavItem = {
  href: string;
  label: string;
  menu?: NavMenu;
};

/**
 * Header navigation. The dropdown menus are generated from the same data the
 * page sections use (lib/services.ts, lib/plans.ts), so they never drift apart.
 */
export const NAV_ITEMS: NavItem[] = [
  {
    href: "/#services",
    label: "Services",
    menu: {
      title: "Our services",
      columns: 2,
      viewAll: { label: "View all services", href: "/#services" },
      items: [
        {
          label: FEATURED_SERVICE.title,
          href: `/book?service=${FEATURED_SERVICE.slug}`,
          sub: "Inspection & quote",
          image: { src: "/images/services/general-service-thumb.png", position: "center" },
        },
        ...SERVICES.map((s) => ({
          label: s.title.join(" "),
          href: `/book?service=${s.slug}`,
          image: { src: s.image.src, position: "right center" },
        })),
      ],
    },
  },
  {
    href: "/#plans",
    label: "Maintenance plans",
    menu: {
      title: "Maintenance plans",
      columns: 1,
      viewAll: { label: "View all plans", href: "/#plans" },
      // order: short → long
      items: [...OTHER_PLANS, ANNUAL_PLAN].map((p) => ({
        label: p.title.join(" "),
        href: `/plans/${p.slug}`,
        sub: p.duration,
        // purpose-cut thumbnails (2x) so they stay crisp at 84x52
        image: { src: `/images/plans/${p.slug}-thumb.png`, position: "center" },
      })),
    },
  },
  { href: "/#how-it-works", label: "How it works" },
];

/** Flat list used by scroll-spy. */
export const NAV_LINKS = NAV_ITEMS.map(({ href, label }) => ({ href, label }));
