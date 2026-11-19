import Image from "next/image";
import { AppFeatures } from "./app-features";
import { AppPhone } from "./app-phone";
import { APP_BADGES, APP_FEATURES, APP_SUBTITLE, APP_TITLE } from "@/lib/app";

/**
 * "Your bike service, in your pocket." — the mobile-app promo, last section of the home page (id="app").
 * Heading words slide up on scroll (CSS only); the feature grid and the phone photo are small client parts.
 */
export function AppSection() {
  // running word index across both heading lines, for the staggered slide-up
  const offsets = APP_TITLE.map((_, i) => APP_TITLE.slice(0, i).reduce((n, l) => n + l.split(" ").length, 0));

  return (
    <section
      id="app"
      aria-labelledby="app-heading"
      className="relative overflow-x-clip border-t border-white/[0.06] bg-surface scroll-mt-14 sm:scroll-mt-[60px] lg:min-h-[calc(100svh-60px)]"
    >
      <div className="mx-auto grid w-full max-w-[1920px] lg:min-h-[inherit] lg:grid-cols-[54%_1fr]">
        {/* ---------- text ---------- */}
        <div className="relative z-10 flex flex-col justify-center px-5 pb-6 pt-10 sm:px-8 sm:pt-14 lg:py-10 lg:pl-[4.5vw] lg:pr-0">
          <span className="reveal mb-3 block h-1 w-14 bg-brand sm:mb-4 sm:w-[84px]" aria-hidden="true" />

          <h2
            id="app-heading"
            aria-label={APP_TITLE.join(" ")}
            className="font-display text-[clamp(1.9rem,8vw,2.8rem)] uppercase leading-[1] tracking-[0.005em] text-cream sm:text-[clamp(2.6rem,6vw,4.2rem)] lg:text-[clamp(2.8rem,min(5.1vw,10vh),5.6rem)]"
          >
            {APP_TITLE.map((line, li) => (
              <span key={line} aria-hidden="true" className="block">
                {line.split(" ").map((word, wi) => (
                  <span key={`${word}-${wi}`} className="inline-block overflow-hidden pb-[0.06em] align-bottom">
                    <span className="word-up inline-block" style={{ ["--w" as string]: offsets[li] + wi }}>
                      {word}
                      {" "}
                    </span>
                  </span>
                ))}
              </span>
            ))}
          </h2>

          <p
            className="reveal mt-3 text-[14px] text-cream/70 sm:mt-3 sm:text-base lg:mt-4 lg:text-[clamp(1rem,1.35vw,1.55rem)]"
            style={{ ["--i" as string]: 1 }}
          >
            {APP_SUBTITLE}
          </p>

          <div className="mt-5 sm:mt-7 lg:mt-8">
            <AppFeatures features={APP_FEATURES} />
          </div>

          <div className="mt-6 grid max-w-[26rem] grid-cols-2 gap-3 sm:mt-8 sm:flex sm:max-w-none sm:flex-wrap lg:mt-9 lg:gap-4">
            {APP_BADGES.map((b, i) => (
              <a
                key={b.key}
                href={b.href}
                aria-label={b.label}
                {...(b.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="reveal group/badge relative block overflow-hidden rounded-[14px] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_14px_28px_-14px_rgba(255,255,255,0.35)] active:translate-y-0 active:scale-[0.98]"
                style={{ ["--i" as string]: i + 6 }}
              >
                <Image
                  src={b.image.src}
                  alt={b.label}
                  width={b.image.width}
                  height={b.image.height}
                  unoptimized
                  className="block h-auto w-full sm:w-[185px] lg:w-[clamp(180px,15.5vw,290px)]"
                />
                {/* light sweep on hover */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/4 -skew-x-[20deg] bg-white/15 opacity-0 transition-[transform,opacity] duration-700 ease-out group-hover/badge:translate-x-[520%] group-hover/badge:opacity-100"
                />
              </a>
            ))}
          </div>
        </div>

        {/* ---------- phone photo: right on desktop, below the text on phones ---------- */}
        <div className="reveal relative aspect-[796/941] sm:aspect-auto sm:h-[72vw] lg:h-auto" style={{ ["--i" as string]: 3 }}>
          <AppPhone />
        </div>
      </div>
    </section>
  );
}
