"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { AppFeature } from "@/lib/app";

const CYCLE_MS = 2600;

/**
 * The 2x2 feature grid. While it is on screen the highlight walks through the four features by itself
 * (the icon gets a crisp expanding ring, the label brightens); hovering a feature takes over and pauses it.
 * Reduced-motion users get no automatic cycling.
 */
export function AppFeatures({ features }: { features: AppFeature[] }) {
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const paused = useRef(false);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => {
      if (!paused.current) setActive((a) => (a + 1) % features.length);
    }, CYCLE_MS);
    return () => window.clearInterval(t);
  }, [inView, features.length]);

  return (
    <ul
      ref={listRef}
      className="grid max-w-[26rem] grid-cols-2 gap-x-3 gap-y-4 sm:max-w-[40rem] sm:gap-x-8 sm:gap-y-6 lg:gap-x-10 lg:gap-y-7"
      onPointerLeave={() => {
        paused.current = false;
      }}
    >
      {features.map((f, i) => (
        <li
          key={f.key}
          data-active={i === active}
          className="app-feature reveal flex items-center gap-3 sm:gap-4 lg:gap-5"
          style={{ "--i": i + 2 } as CSSProperties}
          onPointerEnter={(e) => {
            if (e.pointerType !== "mouse") return;
            paused.current = true;
            setActive(i);
          }}
        >
          <span className="app-icon relative grid size-[clamp(2.4rem,3.7vw,3.9rem)] shrink-0 place-items-center">
            <span aria-hidden="true" className="app-ring" />
            <Image src={f.icon.src} alt="" width={f.icon.width} height={f.icon.height} unoptimized className="relative size-full object-contain" />
          </span>
          <span className="app-label text-[14px] font-semibold leading-[1.15] sm:text-lg lg:text-[clamp(1.1rem,1.6vw,1.8rem)]">
            {f.lines[0]}
            <br />
            {f.lines[1]}
          </span>
        </li>
      ))}
    </ul>
  );
}
