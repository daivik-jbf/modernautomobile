import Image from "next/image";
import { BookingForm } from "./booking-form";

/**
 * Hero layout
 * - The photo is the star: on lg+ it takes the left ~59% of the width, shown at roughly 1:1 so it stays sharp (sized by width,
 *   not `object-cover`, so the mechanics never slide under the text at any screen size).
 *   Its right edge fades into the dark stage colour, so there is no visible seam.
 * - The content column (headline + form) is intentionally compact, on the right.
 * - <lg: photo on top, fading down into the content.
 *
 * `public/images/hero-left-v2.png` is a cropped + upscaled + sharpened version of
 * `assets/home_page_image.png` (the empty right half of the original was removed).
 * For a truly crisp result, replace it with a higher-resolution original (3000px+ wide).
 */
export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate flex flex-col overflow-hidden bg-stage sm:min-h-[calc(100svh-60px)] lg:min-h-[max(calc(100svh-60px),42vw)]"
    >
      <div className="absolute inset-x-0 top-0 -z-10 h-[79vw] overflow-hidden lg:left-0 lg:right-auto lg:h-auto lg:w-[59vw] lg:overflow-visible">
        <Image
          src="/images/hero-left-v2.png"
          alt=""
          width={2260}
          height={1794}
          loading="eager"
          fetchPriority="high"
          sizes="(min-width: 1024px) 59vw, 100vw"
          quality={92}
          className="animate-photo-in block h-auto w-full max-w-none [mask-image:linear-gradient(to_bottom,#000_82%,transparent)] lg:[mask-image:linear-gradient(to_right,#000_80%,transparent)]"
        />
        {/* The photo itself is masked to transparent at its outer edge, so no hairline can show at the seam. */}
        {/* lg+: soft darkening, then melt into the stage colour on the right edge */}
        <div className="absolute inset-0 hidden bg-gradient-to-r from-black/12 from-0% via-black/28 via-78% to-stage to-100% lg:block" />
        {/* lg+: if the viewport is taller than the photo, melt the floor into the stage */}
        <div className="absolute inset-x-0 bottom-0 hidden h-[12%] bg-gradient-to-b from-transparent to-stage lg:block" />
        {/* <lg: fade the photo into the dark stage so the headline reads cleanly */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 from-45% to-stage to-100% lg:hidden" />
      </div>

      <div className="grid w-full flex-1 content-start px-5 pb-10 pt-[75vw] sm:px-8 sm:pb-12 lg:grid-cols-[58%_1fr] lg:content-center lg:items-center lg:px-0 lg:py-14 lg:pr-[4.4%]">
        <div aria-hidden="true" className="hidden lg:block" />

        <div className="min-w-0">
          <h1
            id="hero-heading"
            className="animate-fade-up font-display text-[clamp(2rem,8.6vw,3rem)] uppercase leading-[0.95] tracking-[0.005em] text-balance text-cream sm:text-[clamp(3rem,7vw,4.5rem)] lg:text-[4.3vw] lg:leading-[0.92] lg:tracking-[-0.01em] lg:text-wrap"
          >
            The smartest pit stop for your bike.
          </h1>

          <div className="animate-fade-up mt-4 [animation-delay:180ms] sm:mt-6 lg:mt-7">
            <BookingForm />
          </div>
        </div>
      </div>
    </section>
  );
}
