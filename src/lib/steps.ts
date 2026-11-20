/**
 * "How Maadan Automobiles works" — the 5-step customer journey (home page, #how-it-works).
 * Photos: public/images/how/step-N-<hash>.webp, listed in how-images.json — both generated from
 * assets/how_modernautomobiles_images by `npm run images:how` (run it after replacing any image there).
 */

import howImages from "./how-images.json";

export type Step = {
  n: string;
  /** short label for the step tabs */
  tab: string;
  /** big title, one entry per line */
  title: string[];
  body: string;
  image: { src: string; width: number; height: number; focus: string };
};

export const HOW_TITLE = "How Maadan Automobiles works";
export const HOW_SUBTITLE = "Follow every service update in your mobile app.";

export const STEPS: Step[] = [
  {
    n: "01",
    tab: "Booking",
    title: ["Book your", "visit"],
    body: "Choose a time and arrange pickup or drop-off.",
    image: { ...howImages["1"], focus: "58% 14%" },
  },
  {
    n: "02",
    tab: "Inspection",
    title: ["Inside the", "inspection"],
    body: "Your technician checks your bike and sends the findings to your app.",
    image: { ...howImages["2"], focus: "50% 22%" },
  },
  {
    n: "03",
    tab: "Quote approval",
    title: ["Approve", "the quote"],
    body: "Check itemised parts, labour and the promised ready time. Repairs start only after you approve.",
    image: { ...howImages["3"], focus: "42% 45%" },
  },
  {
    n: "04",
    tab: "Repairs",
    title: ["Track your", "service"],
    body: "Follow repairs and final checks in the app. We’ll tell you when your bike is ready.",
    image: { ...howImages["4"], focus: "62% 55%" },
  },
  {
    n: "05",
    tab: "Handover",
    title: ["Collect", "and earn"],
    body: "Get your digital job card, invoice and loyalty coins with every completed service.",
    image: { ...howImages["5"], focus: "48% 30%" },
  },
];
