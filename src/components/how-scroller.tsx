"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { Step } from "@/lib/steps";

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * "How it works" as a scroll-driven walkthrough.
 *
 * The section is taller than the screen; its inner panel is `position: sticky`, so the page
 * stays pinned on one panel while the scroll position decides which step is shown.
 *  - The active step is discrete (React state, changes only at step boundaries).
 *  - Everything continuous (the red progress bar, the photo parallax) is driven by a per-element
 *    `--lp` CSS variable (0 → 1 across that step) written straight to the DOM in a rAF loop,
 *    so scrolling never triggers a React re-render.
 *  - Slides animate by `data-state` = before | active | after, so content enters from below when
 *    scrolling down and from above when scrolling up (see `.how-*` rules in globals.css).
 * Works with touch scrolling (native sticky), keyboard (tabs are buttons) and reduced motion.
 */
export function HowScroller({ steps, heading }: { steps: Step[]; heading: ReactNode }) {
  const n = steps.length;
  const [active, setActive] = useState(0);
  const outerRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const slideEls = useRef<(HTMLElement | null)[]>([]);
  const tabEls = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const outer = outerRef.current;
    const pin = pinRef.current;
    if (!outer || !pin) return;

    let raf = 0;
    let last = -1;
    let stickyTop = parseFloat(getComputedStyle(pin).top) || 0;

    const update = () => {
      raf = 0;
      const rect = outer.getBoundingClientRect();
      const travel = Math.max(1, outer.offsetHeight - pin.offsetHeight);
      const p = clamp((stickyTop - rect.top) / travel, 0, 1);
      const x = p * n; // 0 … n, each step owns one unit

      for (let i = 0; i < n; i++) {
        const lp = clamp(x - i, 0, 1).toFixed(4);
        slideEls.current[i]?.style.setProperty("--lp", lp);
        tabEls.current[i]?.style.setProperty("--lp", lp);
      }
      const idx = Math.min(n - 1, Math.floor(x));
      if (idx !== last) {
        last = idx;
        setActive(idx);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      stickyTop = parseFloat(getComputedStyle(pin).top) || 0;
      onScroll();
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [n]);

  /** scroll the page so that step `i` is in the middle of its share of the travel */
  const goTo = (i: number) => {
    const outer = outerRef.current;
    const pin = pinRef.current;
    if (!outer || !pin) return;
    const stickyTop = parseFloat(getComputedStyle(pin).top) || 0;
    const travel = outer.offsetHeight - pin.offsetHeight;
    const outerTop = outer.getBoundingClientRect().top + window.scrollY;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: outerTop - stickyTop + ((i + 0.5) / n) * travel,
      behavior: reduced ? "auto" : "smooth",
    });
  };

  const stateOf = (i: number) => (i < active ? "before" : i > active ? "after" : "active");
  const last = active === n - 1;

  return (
    <section
      ref={outerRef}
      id="how-it-works"
      aria-labelledby="how-heading"
      className="how-outer relative scroll-mt-14 border-t border-white/[0.06] bg-surface sm:scroll-mt-[60px]"
      style={{ "--n": n } as CSSProperties}
    >
      <div ref={pinRef} className="how-pin flex flex-col px-5 pb-3 pt-4 sm:px-8 sm:pb-4 sm:pt-6 lg:px-[5%]">
        {heading}

        {/* ---------- the panel ---------- */}
        <div className="relative mt-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-white/[0.18] bg-[#131313] sm:mt-4 lg:block">
          {/* photos (right on desktop, top on phones), each fades/zooms in when its step is active */}
          <div className="relative min-h-[8rem] flex-1 [mask-image:linear-gradient(to_bottom,#000_66%,transparent)] lg:absolute lg:inset-y-0 lg:left-auto lg:right-0 lg:min-h-0 lg:w-[67%] lg:flex-none lg:[mask-image:linear-gradient(to_right,transparent,#000_34%)]">
            {steps.map((s, i) => (
              <div
                key={s.n}
                ref={(el) => {
                  slideEls.current[i] = el;
                }}
                data-state={stateOf(i)}
                className="how-photo absolute inset-0"
                aria-hidden="true"
              >
                <div className="how-parallax absolute -inset-[3%]">
                  <Image
                    src={s.image.src}
                    alt=""
                    fill
                    unoptimized
                    priority={i < 2}
                    sizes="(min-width: 1024px) 60vw, 100vw"
                    className="object-cover"
                    style={{ objectPosition: s.image.focus }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* text */}
          <div
            aria-live="polite"
            className="relative z-10 -mt-7 grid shrink-0 px-5 pb-5 sm:-mt-10 sm:px-8 sm:pb-7 lg:absolute lg:inset-y-0 lg:left-0 lg:right-auto lg:mt-0 lg:w-[46%] lg:items-center lg:px-0 lg:pb-0 lg:pl-[6%] lg:pr-4"
          >
            {steps.map((s, i) => (
              <div
                key={s.n}
                data-state={stateOf(i)}
                aria-hidden={i !== active}
                className="how-slide col-start-1 row-start-1 self-end lg:self-center"
              >
                <p
                  className="how-item flex items-baseline gap-2 font-condensed font-semibold italic leading-none tracking-wide"
                  style={{ "--d": 0 } as CSSProperties}
                >
                  <span className="text-[clamp(1.7rem,min(3.4vw,6.2vh),3.5rem)] text-brand-logo">{s.n}</span>
                  <span className="text-[clamp(1.1rem,min(1.9vw,3.4vh),2rem)] text-cream/45">/ {String(n).padStart(2, "0")}</span>
                </p>
                <h3
                  className="how-item mt-2 font-display text-[clamp(1.9rem,min(8.6vw,8.4vh),2.7rem)] uppercase leading-[1.02] tracking-[0.01em] text-cream sm:mt-3 lg:text-[clamp(2.4rem,min(5vw,9.2vh),5.2rem)]"
                  style={{ "--d": 1 } as CSSProperties}
                >
                  {s.title.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </h3>
                <p
                  className="how-item mt-3 max-w-[24rem] text-[15px] leading-snug text-cream/90 sm:mt-4 sm:text-lg lg:max-w-[26rem] lg:text-[clamp(1.05rem,min(1.5vw,2.9vh),1.7rem)]"
                  style={{ "--d": 2 } as CSSProperties}
                >
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ---------- step tabs / progress ---------- */}
        <nav aria-label="Steps" className="mt-3 grid grid-cols-5 border-t border-white/20 sm:mt-4">
          {steps.map((s, i) => (
            <button
              key={s.n}
              ref={(el) => {
                tabEls.current[i] = el;
              }}
              type="button"
              data-state={stateOf(i)}
              aria-current={i === active ? "step" : undefined}
              aria-label={`Step ${i + 1}: ${s.tab}`}
              onClick={() => goTo(i)}
              className="how-tab group relative flex cursor-pointer items-baseline justify-center gap-2.5 px-1 pb-1 pt-3 text-left sm:justify-start sm:px-4 sm:pt-3.5 lg:px-5"
            >
              <span aria-hidden="true" className="how-tab-bar absolute left-0 right-0 top-[-1px]" />
              {i > 0 && <span aria-hidden="true" className="absolute left-0 top-1/2 h-6 w-px -translate-y-1/3 bg-white/25 sm:top-[55%]" />}
              <span className="how-tab-n font-condensed text-[17px] font-semibold tracking-wide sm:text-[22px]">{s.n}</span>
              <span className="how-tab-label hidden truncate text-[15px] font-medium md:inline lg:text-xl">{s.tab}</span>
            </button>
          ))}
        </nav>

        {/* scroll hint */}
        <p className="mt-2 flex h-6 items-center gap-2 text-[14px] text-cream/70 sm:mt-3 sm:text-base">
          <span key={last ? "end" : "go"} className="animate-fade-up">
            {last ? "Continue" : "Scroll to explore"}
          </span>
          <svg viewBox="0 0 24 24" className="how-bob size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 4v16M6 14l6 6 6-6" />
          </svg>
        </p>
      </div>
    </section>
  );
}
