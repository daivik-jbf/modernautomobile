import Image from "next/image";
import Link from "next/link";
import { AboutPhoto } from "./about-photo";
import { ArrowRight } from "./icons";
import { ABOUT_CTA, ABOUT_EXPECT_TITLE, ABOUT_EYEBROW, ABOUT_POINTS, ABOUT_TEXT, ABOUT_TITLE } from "@/lib/about";

/**
 * "The people behind your pit stop." — About us, last section of the home page (id="about").
 * Heading words slide up on scroll and the photo wipes in (CSS only); the three promises stagger in.
 */
export function AboutSection() {
  // running word index across both heading lines, for the staggered slide-up
  const offsets = ABOUT_TITLE.map((_, i) => ABOUT_TITLE.slice(0, i).reduce((n, l) => n + l.split(" ").length, 0));

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="relative overflow-x-clip border-t border-white/[0.06] bg-surface scroll-mt-14 sm:scroll-mt-[60px] lg:flex lg:min-h-[calc(100svh-60px)] lg:flex-col"
    >
      {/* ---------- top: text + photo ---------- */}
      <div className="relative flex flex-col lg:flex-none">
        <div className="relative z-10 px-5 pb-6 pt-10 sm:px-8 sm:pt-14 lg:max-w-[46%] lg:px-0 lg:pb-12 lg:pl-[4.2vw] lg:pt-[clamp(1.5rem,5.5vh,3.5rem)]">
          <p className="reveal font-condensed text-[15px] font-semibold uppercase tracking-[0.08em] text-cream sm:text-lg">
            {ABOUT_EYEBROW}
            <span className="mt-2 block h-[3px] w-12 bg-brand sm:w-16" aria-hidden="true" />
          </p>

          <h2
            id="about-heading"
            aria-label={ABOUT_TITLE.join(" ")}
            className="mt-4 font-display text-[clamp(1.9rem,8vw,2.8rem)] uppercase leading-[1] tracking-[0.005em] text-cream sm:text-[clamp(2.6rem,6vw,4.2rem)] lg:mt-5 lg:text-[clamp(2.8rem,min(5.1vw,9.5vh),5.6rem)]"
          >
            {ABOUT_TITLE.map((line, li) => (
              <span key={line} aria-hidden="true" className="block">
                {line.split(" ").map((word, wi) => (
                  <span key={`${word}-${wi}`} className="mr-[0.24em] inline-block overflow-hidden pb-[0.06em] align-bottom">
                    <span className="word-up inline-block" style={{ ["--w" as string]: offsets[li] + wi }}>
                      {word}
                    </span>
                  </span>
                ))}
              </span>
            ))}
          </h2>

          <p
            className="reveal mt-4 max-w-[34rem] text-[15px] leading-relaxed text-cream/80 sm:text-base lg:mt-5 lg:text-[clamp(1rem,1.3vw,1.5rem)]"
            style={{ ["--i" as string]: 1 }}
          >
            {ABOUT_TEXT}
          </p>
        </div>

        {/* photo: below the text on phones, melting in from the right on desktop */}
        <div className="about-photo-frame relative aspect-[965/476] w-full sm:mx-auto sm:max-w-[40rem] lg:absolute lg:inset-y-0 lg:right-0 lg:mx-0 lg:aspect-auto lg:w-[60%] lg:max-w-none">
          <AboutPhoto />
        </div>
      </div>

      {/* ---------- what you can expect ---------- */}
      <div className="relative z-10 flex flex-1 flex-col justify-center px-5 pb-12 pt-6 sm:px-8 sm:pt-8 lg:px-0 lg:pb-8 lg:pl-[4.2vw] lg:pr-[4%] lg:pt-4">
        <h3 className="reveal font-display text-[clamp(1.5rem,6vw,2rem)] uppercase leading-none tracking-[0.01em] text-cream sm:text-3xl lg:text-[clamp(1.9rem,min(3.1vw,6vh),3.2rem)]">
          {ABOUT_EXPECT_TITLE}
          <span className="mt-3 block h-[3px] w-14 bg-brand sm:w-[70px]" aria-hidden="true" />
        </h3>

        <ul className="mt-6 grid gap-0 lg:mt-[clamp(1.25rem,3.4vh,2rem)] lg:grid-cols-3">
          {ABOUT_POINTS.map((p, i) => (
            <li
              key={p.key}
              className="about-point reveal relative flex items-start gap-4 border-t border-white/10 py-5 first:border-t-0 first:pt-0 sm:gap-5 lg:gap-6 lg:border-l lg:border-t-0 lg:px-[clamp(1.5rem,3.2vw,3.5rem)] lg:py-0 lg:first:border-l-0 lg:first:pl-0"
              style={{ ["--i" as string]: i + 2 }}
            >
              <span className="about-icon relative grid size-[clamp(2.6rem,4vw,4.4rem)] shrink-0 place-items-center">
                <Image src={p.icon.src} alt="" width={p.icon.width} height={p.icon.height} unoptimized className="relative size-full object-contain" />
              </span>
              <span className="min-w-0">
                <span className="block font-condensed text-[1.15rem] font-semibold uppercase leading-tight tracking-[0.03em] text-cream sm:text-xl lg:text-[clamp(1.2rem,1.9vw,2.1rem)]">
                  {p.title}
                </span>
                <span className="mt-1.5 block text-[14px] leading-snug text-cream/75 sm:text-[15px] lg:text-[clamp(0.95rem,1.15vw,1.3rem)]">
                  {p.text}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <Link
          href={ABOUT_CTA.href}
          className="about-cta reveal group/cta mt-7 inline-flex w-fit items-center gap-3 pb-2 font-condensed text-[15px] font-semibold uppercase tracking-[0.06em] text-cream sm:text-lg lg:mt-[clamp(1.25rem,3.6vh,2.25rem)] lg:text-[clamp(1.05rem,1.4vw,1.6rem)]"
          style={{ ["--i" as string]: 5 }}
        >
          {ABOUT_CTA.label}
          <ArrowRight className="size-4 transition-transform duration-300 group-hover/cta:translate-x-1.5 sm:size-5" />
        </Link>
      </div>
    </section>
  );
}
