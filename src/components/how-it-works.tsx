import { HowScroller } from "./how-scroller";
import { HOW_SUBTITLE, HOW_TITLE, STEPS } from "@/lib/steps";

/**
 * "How Maadan Automobiles works" — the last section of the home page (id="how-it-works").
 * Server part: the heading (words slide up on scroll, CSS only). The pinned, scroll-driven
 * walkthrough lives in <HowScroller /> (client).
 */
export function HowItWorksSection() {
  const words = HOW_TITLE.split(" ");

  const heading = (
    <div>
      <span className="reveal mb-2 block h-1 w-14 bg-brand sm:mb-3 sm:w-[84px]" aria-hidden="true" />
      <h2
        id="how-heading"
        aria-label={HOW_TITLE}
        className="font-display text-[clamp(1.7rem,7.4vw,2.2rem)] uppercase leading-[1.05] tracking-[0.015em] text-cream sm:text-[clamp(2.2rem,min(3.2vw,6vh),3.6rem)]"
      >
        {words.map((w, i) => (
          <span key={i} aria-hidden="true" className="inline-block overflow-hidden pb-[0.06em] align-bottom">
            <span className="word-up inline-block" style={{ ["--w" as string]: i }}>
              {w}
              {i < words.length - 1 ? " " : ""}
            </span>
          </span>
        ))}
      </h2>
      <p
        className="reveal mt-1 text-[14px] text-cream/90 max-[420px]:hidden sm:mt-1.5 sm:text-lg [@media(max-height:620px)]:hidden"
        style={{ ["--i" as string]: 1 }}
      >
        {HOW_SUBTITLE}
      </p>
    </div>
  );

  return <HowScroller steps={STEPS} heading={heading} />;
}
