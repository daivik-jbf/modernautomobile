/**
 * Content for the mobile-app promo section (home page, #app): "Your bike service, in your pocket."
 * Pictures: public/images/app/<name>-<hash>.webp, listed in app-images.json — both generated from
 * assets/Modern-Automobiles-App-Promo-Assets by `npm run images:app` (run it after replacing a picture).
 */
import appImages from "./app-images.json";

type Pic = { src: string; width: number; height: number };

const images = appImages as unknown as {
  phone: { width: number; height: number; lqip: string; variants: { width: number; src: string }[] };
  icons: Record<string, Pic>;
  badges: Record<string, Pic>;
};

/**
 * Store links. TODO: paste the real listing URLs here once the app is published —
 * until then the badges just scroll to this section.
 */
export const APP_LINKS = {
  googlePlay: "",
  appStore: "",
};

export const APP_TITLE = ["Your bike service,", "in your pocket."];
export const APP_SUBTITLE = "Track your bike from inspection to handover.";

export type AppFeature = { key: string; lines: [string, string]; icon: Pic };

export const APP_FEATURES: AppFeature[] = [
  { key: "live-service-updates", lines: ["Live service", "updates"], icon: images.icons["live-service-updates"] },
  { key: "quote-approvals", lines: ["Quote", "approvals"], icon: images.icons["quote-approvals"] },
  { key: "job-cards-and-invoices", lines: ["Job cards &", "invoices"], icon: images.icons["job-cards-and-invoices"] },
  { key: "history-and-reminders", lines: ["History &", "reminders"], icon: images.icons["history-and-reminders"] },
];

export const APP_BADGES = [
  { key: "google-play", label: "Get it on Google Play", href: APP_LINKS.googlePlay || "#app", image: images.badges["google-play"] },
  { key: "app-store", label: "Download on the App Store", href: APP_LINKS.appStore || "#app", image: images.badges["app-store"] },
];

export const APP_PHONE = images.phone;
