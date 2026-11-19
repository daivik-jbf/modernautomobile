"use client";

import Image from "next/image";
import hero from "@/lib/hero-images.json";

/**
 * The hero photo, built for a fast first paint:
 *  - responsive, pre-built WebP files (see scripts/build-hero-image.cjs) — no on-demand server resizing
 *  - a tiny blurred preview is inlined in the HTML, so something photo-like shows instantly; the real
 *    photo simply paints over it the moment it has arrived
 *  - no JavaScript is needed for the photo to appear (it is plain server-rendered HTML + CSS), so it never
 *    waits for the app bundle to download and hydrate — important on slow phones
 */
const variants = hero.variants;

/** pick the smallest pre-built file that is at least `width` px wide (next/image passes the wanted width) */
const loader = ({ width }: { src: string; width: number }) =>
  (variants.find((v) => v.width >= width) ?? variants[variants.length - 1]).src;

export function HeroPhoto() {
  return (
    // the whole photo (preview + image) is masked to transparent at its outer edge, so no hairline can
    // show where it meets the page: bottom edge on phones, right edge on desktop
    <div className="relative [mask-image:linear-gradient(to_bottom,#000_82%,transparent)] lg:[mask-image:linear-gradient(to_right,#000_80%,transparent)]">
      {/* instant blurred preview */}
      <div
        aria-hidden="true"
        className="absolute inset-0 scale-110 bg-cover bg-left-top blur-xl"
        style={{ backgroundImage: `url(${hero.lqip})` }}
      />
      <Image
        src={variants[variants.length - 1].src}
        loader={loader}
        alt=""
        width={hero.width}
        height={hero.height}
        loading="eager"
        fetchPriority="high"
        sizes="(min-width: 1024px) 59vw, 100vw"
        className="animate-photo-in relative block h-auto w-full max-w-none"
      />
    </div>
  );
}
