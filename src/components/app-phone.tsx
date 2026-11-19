"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { APP_PHONE } from "@/lib/app";

const variants = APP_PHONE.variants;

/** pick the smallest pre-built file that is at least `width` px wide */
const loader = ({ width }: { src: string; width: number }) =>
  (variants.find((v) => v.width >= width) ?? variants[variants.length - 1]).src;

/**
 * The phone-and-workshop photo. Pre-built responsive WebP files (no on-demand resizing), an inline blurred
 * preview, shown whole (never cropped), and a gentle scroll parallax (the photo drifts a few pixels against the scroll). The drift is
 * written as a CSS variable from a rAF loop (no React renders) and rounded to whole pixels in CSS, so the
 * photo never rests on a half-pixel and stays crisp.
 */
export function AppPhone() {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = box.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the box is just entering from the bottom, 1 when it has just left at the top
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
      box.style.setProperty("--app-p", p.toFixed(3));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={boxRef} className="absolute inset-0">
      {/*
        The photo is sized by its own aspect ratio (full height, never cropped), right-aligned on desktop and
        centred on phones. The soft fade into the dark page is applied to the photo itself, so its edge always
        melts away no matter how wide the column is.
      */}
      <div className="app-parallax absolute inset-y-0 left-1/2 aspect-[796/941] h-full w-auto max-w-full -translate-x-1/2 overflow-hidden [mask-composite:intersect] [-webkit-mask-composite:source-in] [mask-image:linear-gradient(to_bottom,transparent,#000_14%,#000_88%,transparent),linear-gradient(to_right,transparent,#000_9%,#000_91%,transparent)] lg:left-auto lg:right-0 lg:translate-x-0 lg:[mask-image:linear-gradient(to_bottom,transparent,#000_8%,#000_92%,transparent),linear-gradient(to_right,transparent,#000_30%)]">
        {/* instant blurred preview */}
        <div
          aria-hidden="true"
          className="absolute inset-0 scale-110 bg-cover bg-center blur-xl"
          style={{ backgroundImage: `url(${APP_PHONE.lqip})` }}
        />
        <Image
          src={variants[variants.length - 1].src}
          loader={loader}
          alt="The Modern Automobiles app on a phone showing a service awaiting approval, with the workshop in the background"
          width={APP_PHONE.width}
          height={APP_PHONE.height}
          sizes="(min-width: 1024px) 48vw, 100vw"
          className="relative h-full w-full object-cover object-right"
        />
      </div>
    </div>
  );
}
