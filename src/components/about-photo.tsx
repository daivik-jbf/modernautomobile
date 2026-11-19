"use client";

import Image from "next/image";
import { ABOUT_PHOTO } from "@/lib/about";

const variants = ABOUT_PHOTO.variants;

/** pick the smallest pre-built file that is at least `width` px wide */
const loader = ({ width }: { src: string; width: number }) =>
  (variants.find((v) => v.width >= width) ?? variants[variants.length - 1]).src;

/**
 * The two technicians at the workshop. Pre-built responsive WebP files (no on-demand resizing) over an
 * inline blurred preview. The entrance (a wipe-in plus a slow zoom-out) is pure CSS — see `.about-photo`.
 */
export function AboutPhoto() {
  return (
    <div className="about-photo absolute inset-0">
      <div
        aria-hidden="true"
        className="absolute inset-0 scale-110 bg-cover bg-center blur-xl"
        style={{ backgroundImage: `url(${ABOUT_PHOTO.lqip})` }}
      />
      <Image
        src={variants[variants.length - 1].src}
        loader={loader}
        alt="Two Modern Automobiles technicians inspecting a motorcycle in the workshop and reviewing it on a tablet"
        width={ABOUT_PHOTO.width}
        height={ABOUT_PHOTO.height}
        sizes="(min-width: 1024px) 60vw, 100vw"
        className="about-photo-img relative h-full w-full object-cover object-right"
      />
    </div>
  );
}
