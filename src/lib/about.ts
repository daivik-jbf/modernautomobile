/**
 * Content for the About us section (home page, #about) and the site footer.
 * Pictures: public/images/about/<name>-<hash>.webp, listed in about-images.json — both generated from
 * assets/Modern-Automobiles-About-Us-Assets by `npm run images:about` (run it after replacing a picture).
 */
import aboutImages from "./about-images.json";

type Pic = { src: string; width: number; height: number };

const images = aboutImages as unknown as {
  team: { width: number; height: number; lqip: string; variants: { width: number; src: string }[] };
  icons: Record<string, Pic>;
};

export const ABOUT_EYEBROW = "About us";
export const ABOUT_TITLE = ["The people behind", "your pit stop."];
export const ABOUT_TEXT =
  "After inspecting your bike, we give you a fair, itemised quote for parts and labour. You pay only for the work you approve.";
export const ABOUT_EXPECT_TITLE = "What you can expect";
export const ABOUT_CTA = { label: "See how service works", href: "/#how-it-works" };

export type AboutPoint = { key: string; title: string; text: string; icon: Pic };

export const ABOUT_POINTS: AboutPoint[] = [
  { key: "inspection", title: "A clear inspection", text: "See what your technician found.", icon: images.icons["inspection"] },
  {
    key: "approval",
    title: "Your approval first",
    text: "If we find more work is needed, we send a revised quote and wait for your approval.",
    icon: images.icons["approval"],
  },
  {
    key: "service-record",
    title: "A service record",
    text: "Keep your digital job card and invoice in the app.",
    icon: images.icons["service-record"],
  },
];

export const ABOUT_PHOTO = images.team;

/**
 * Contact details for the footer's "Contact us". TODO: fill in — until then the link just scrolls to the footer.
 * e.g. email: "hello@maadanautomobiles.in", phone: "+91 98765 43210"
 */
export const CONTACT = { email: "", phone: "" };
