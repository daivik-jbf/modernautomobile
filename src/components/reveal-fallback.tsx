"use client";

import { useEffect } from "react";

/**
 * Scroll reveals are done in CSS with scroll-driven animations (`animation-timeline: view()`),
 * which Chrome/Edge/Android support but older iOS Safari does not.
 * When it's unsupported, this adds an IntersectionObserver-based reveal so phones get the
 * same entrance effects (see the `.io-reveal` rules in globals.css). Renders nothing.
 */
export function RevealFallback() {
  useEffect(() => {
    if (typeof CSS !== "undefined" && CSS.supports("animation-timeline: view()")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    const els = Array.from(
      document.querySelectorAll<HTMLElement>(".reveal, .word-up"),
    );

    // `.word-up` sits inside an overflow-hidden wrapper, so while it is translated away the
    // observer would see it as fully clipped. Observe the wrapper and reveal the word instead.
    const targets = new Map<Element, HTMLElement>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = targets.get(e.target);
          if (el) el.dataset.in = "true";
          io.unobserve(e.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );

    const vh = window.innerHeight;
    for (const el of els) {
      const watch = el.classList.contains("word-up") ? (el.parentElement ?? el) : el;
      targets.set(watch, el);
      // already on screen → show straight away (no hide-then-flash)
      const r = watch.getBoundingClientRect();
      if (r.top < vh * 0.94 && r.bottom > 0) el.dataset.in = "true";
      else io.observe(watch);
    }
    root.classList.add("io-reveal");

    return () => {
      io.disconnect();
      root.classList.remove("io-reveal");
    };
  }, []);

  return null;
}
