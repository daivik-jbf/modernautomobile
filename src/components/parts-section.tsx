import { PartsCarousel } from "./parts-carousel";
import { BRANDS, INITIAL_BRAND, PARTS_TITLE } from "@/lib/parts";

/**
 * "Parts & oils we use" — last section of the home page (id="parts"): a 3D ring of brand tiles.
 * Server part: the heading (words slide up on scroll, CSS only). The ring is <PartsCarousel /> (client).
 */
export function PartsSection() {
  const words = PARTS_TITLE.split(" ");

  return (
    <section
      id="parts"
      aria-labelledby="parts-heading"
      className="relative flex scroll-mt-14 flex-col overflow-x-clip border-t border-white/[0.06] bg-surface sm:scroll-mt-[60px] lg:min-h-[calc(100svh-60px)]"
    >
      <div className="mx-auto flex w-full max-w-[1800px] flex-1 flex-col px-5 py-8 sm:px-8 sm:py-12 lg:px-[4%] lg:py-8">
        <div>
          <span className="reveal mb-2 block h-1 w-14 bg-brand sm:mb-3 sm:w-[84px]" aria-hidden="true" />
          <h2
            id="parts-heading"
            aria-label={PARTS_TITLE}
            className="font-display text-[clamp(1.7rem,7.4vw,2.2rem)] uppercase leading-[1.05] tracking-[0.015em] text-cream sm:text-[clamp(2.2rem,min(3.4vw,6vh),3.8rem)]"
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
        </div>

        <PartsCarousel brands={BRANDS} initial={INITIAL_BRAND} />
      </div>
    </section>
  );
}
