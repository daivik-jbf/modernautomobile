"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";
import type { Brand } from "@/lib/parts";

const AUTO_MS = 3200; // time each brand stays in front during the automatic rotation
const IDLE_MS = 5000; // how long after the visitor's last interaction before auto-rotation resumes

type Ease = (t: number) => number;
/** soft start AND soft finish: no snap at the beginning of a move */
const easeInOutCubic: Ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
/** for the glide after a drag release (it already starts at the drag speed) */
const easeOutCubic: Ease = (t) => 1 - Math.pow(1 - t, 3);
const mod = (a: number, n: number) => ((a % n) + n) % n;

/**
 * 3D circular carousel ("cylinder" of brand tiles).
 *  - Drag / swipe to spin (the front surface follows your finger), release to glide and snap to a tile.
 *  - Arrow buttons, ← → keys, or click a side tile to bring it to the front.
 *  - Rotates by itself while on screen; pauses on hover/focus/touch; spins in when first revealed.
 *  - Reduced-motion users get no auto-rotation and no intro spin.
 * The ring angle lives in a ref and is written straight to the DOM (no React render per frame);
 * only the "active brand" is React state. Geometry comes from CSS variables (see `.parts-*` in globals.css).
 */
export function PartsCarousel({ brands, initial }: { brands: Brand[]; initial: number }) {
  const n = brands.length;
  const step = 360 / n;
  const k = 1.08 / (2 * Math.tan(Math.PI / n)); // ring radius = k × tile width (8% gap between tiles)

  const [active, setActive] = useState(initial);
  const [inView, setInView] = useState(false);
  /** intro: "pending" = hidden until first revealed, "run" = spinning in, "done" = normal */
  const [phase, setPhase] = useState<"pending" | "run" | "done">("pending");

  const sceneRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);
  const angle = useRef(-initial * step);
  const raf = useRef(0);
  const lastTouch = useRef(0);
  const hovering = useRef(false);
  const drag = useRef<{ x0: number; x: number; t: number; v: number; moved: boolean } | null>(null);
  const intro = useRef(false);
  const prepped = useRef(false);
  const introTarget = useRef(0);
  const introRunning = useRef(false);

  /** write the current angle to the DOM: ring rotation, per-tile depth shading, active brand */
  const render = useCallback(() => {
    const a = angle.current;
    if (ringRef.current) ringRef.current.style.transform = `rotateX(var(--tilt)) rotateY(${a}deg)`;
    for (let i = 0; i < n; i++) {
      const d = Math.abs(mod(a + i * step + 180, 360) - 180); // 0 = front … 180 = back
      tileRefs.current[i]?.style.setProperty("--s", (Math.pow(Math.min(1, d / 120), 1.3) * 0.5).toFixed(3));
    }
    if (introRunning.current) return; // keep the label / active tile still while the intro spins
    const idx = mod(Math.round(-a / step), n);
    setActive((prev) => (prev === idx ? prev : idx));
  }, [n, step]);

  const stop = () => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = 0;
  };

  const animateTo = useCallback(
    (target: number, ms: number, ease: Ease = easeInOutCubic, onDone?: () => void) => {
      stop();
      const from = angle.current;
      if (ms <= 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        angle.current = target;
        render();
        onDone?.();
        return;
      }
      const t0 = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / ms);
        angle.current = from + (target - from) * ease(t);
        render();
        if (t < 1) raf.current = requestAnimationFrame(tick);
        else {
          raf.current = 0;
          onDone?.();
        }
      };
      raf.current = requestAnimationFrame(tick);
    },
    [render],
  );

  const touch = () => {
    lastTouch.current = performance.now();
    if (introRunning.current) {
      introRunning.current = false; // the visitor took over: end the intro cleanly
      setPhase("done");
    }
  };
  const goNext = useCallback(() => animateTo(Math.round(angle.current / step) * step - step, 1000), [animateTo, step]);
  const goPrev = useCallback(() => animateTo(Math.round(angle.current / step) * step + step, 1000), [animateTo, step]);
  const goTo = (i: number) => {
    // shortest way round to bring tile i to the front; longer trips take a little longer
    const delta = mod(-i * step - angle.current + 180, 360) - 180;
    animateTo(angle.current + delta, Math.min(1700, 750 + Math.abs(delta) * 8));
  };

  // first paint of the shading; and (unless reduced motion) park the ring 130° off while it is still
  // hidden (data-intro="pending"), so the intro spin starts from there when it is first revealed
  useEffect(() => {
    if (!prepped.current) {
      prepped.current = true;
      introTarget.current = angle.current;
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        angle.current += 130;
        introRunning.current = true; // keeps label / active tile on the starting brand until the intro ends
      }
    }
    render();
    return stop;
  }, [render]);

  // reveal: spin in once when the carousel first scrolls into view; keep `inView` for auto-rotation
  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setInView(e.isIntersecting);
        if (e.isIntersecting && !intro.current) {
          intro.current = true;
          if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setPhase("done"); // no spin: just reveal
          } else {
            introRunning.current = true;
            setPhase("run");
            animateTo(introTarget.current, 2600, easeInOutCubic, () => {
              introRunning.current = false;
              lastTouch.current = performance.now(); // first auto-advance waits a full pause
              setPhase("done");
              render();
            });
          }
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [render, animateTo]);

  // automatic rotation
  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => {
      if (hovering.current || drag.current || introRunning.current) return;
      if (performance.now() - lastTouch.current < IDLE_MS) return;
      goNext();
    }, AUTO_MS);
    return () => window.clearInterval(t);
  }, [inView, goNext]);

  // ----- drag / swipe -----
  const degPerPx = () => {
    // on-screen tile width: the scene is built --z times bigger (see `.parts-zoom` in globals.css)
    const z = zoomRef.current ? parseFloat(getComputedStyle(zoomRef.current).getPropertyValue("--z")) || 1 : 1;
    const tw = (tileRefs.current[0]?.offsetWidth ?? 300 * z) / z;
    return (180 / Math.PI) / (tw * k * 1.35); // front surface follows the pointer
  };
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    stop();
    touch();
    drag.current = { x0: e.clientX, x: e.clientX, t: performance.now(), v: 0, moved: false };
    sceneRef.current?.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const now = performance.now();
    const dx = e.clientX - d.x;
    if (Math.abs(e.clientX - d.x0) > 4) d.moved = true;
    const dTheta = dx * degPerPx();
    angle.current += dTheta;
    d.v = 0.75 * d.v + 0.25 * (dTheta / Math.max(1, now - d.t)); // deg per ms, smoothed
    d.x = e.clientX;
    d.t = now;
    render();
    touch();
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    touch();
    if (d.moved) {
      // if the pointer rested before release there is no fling
      const v = performance.now() - d.t > 90 ? 0 : d.v;
      const projected = angle.current + v * 320; // let it glide a little …
      animateTo(Math.round(projected / step) * step, 1000, easeOutCubic); // … then settle on a tile
    } else {
      // a tap/click: bring the tile under the pointer to the front
      const tile = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>("[data-tile]");
      if (tile) goTo(Number(tile.dataset.tile));
    }
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    touch();
    if (e.key === "ArrowRight") goNext();
    else goPrev();
  };

  return (
    <div className="parts flex flex-1 flex-col justify-center" style={{ "--k": k } as CSSProperties}>
      <noscript>
        <style>{".parts-stage{opacity:1!important}"}</style>
      </noscript>
      <div
        ref={sceneRef}
        className="parts-stage"
        data-intro={phase}
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label="Brands we use, drag or use the arrow keys to rotate"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") hovering.current = true;
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") {
            hovering.current = false;
            touch();
          }
        }}
        onFocus={() => {
          hovering.current = true;
        }}
        onBlur={() => {
          hovering.current = false;
          touch();
        }}
        onKeyDown={onKeyDown}
      >
        <div className="parts-floor" aria-hidden="true" />
        <div ref={zoomRef} className="parts-zoom">
        <div
          ref={ringRef}
          className="parts-ring"
          style={{ transform: `rotateX(var(--tilt)) rotateY(${-initial * step}deg)` }}
        >
          {brands.map((b, i) => (
            <div
              key={b.slug}
              ref={(el) => {
                tileRefs.current[i] = el;
              }}
              data-tile={i}
              data-active={phase === "done" && i === active}
              className="parts-tile"
              style={{ transform: `rotateY(${i * step}deg) translateZ(var(--r))` }}
              aria-hidden="true"
            >
              <div className="parts-face parts-front">
                <Image
                  src={b.image.src}
                  alt=""
                  fill
                  unoptimized
                  draggable={false}
                  sizes="(min-width: 1024px) 460px, 70vw"
                  className="parts-logo object-cover"
                />
                <span className="parts-shade" />
              </div>
              {/* back (inner) face: the same logo, softly blurred and dimmed, like seen through frosted glass */}
              <div className="parts-face parts-back">
                <Image
                  src={b.image.src}
                  alt=""
                  fill
                  unoptimized
                  draggable={false}
                  sizes="240px"
                  className="parts-backlogo object-cover"
                />
                <span className="parts-shade" />
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>

      {/* controls */}
      <div className="mx-auto mt-2 flex w-full max-w-[34rem] items-center justify-center gap-3 sm:mt-4 sm:max-w-none sm:gap-9">
        <button
          type="button"
          onClick={() => {
            touch();
            goPrev();
          }}
          aria-label="Previous brand"
          className="parts-arrow"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 12H4M10 6l-6 6 6 6" />
          </svg>
        </button>
        <p
          aria-live="polite"
          className="min-w-0 flex-1 truncate text-center font-condensed text-[clamp(1.05rem,4.4vw,1.5rem)] font-semibold leading-[1.2] tracking-wide text-cream sm:w-[22rem] sm:flex-none sm:text-[clamp(1.4rem,1.7vw,1.9rem)]"
        >
          <span key={active} className="animate-fade-up inline-block">
            {brands[active]?.name}
          </span>
          <span className="sr-only">
            {" "}
            ({active + 1} of {n})
          </span>
        </p>
        <button
          type="button"
          onClick={() => {
            touch();
            goNext();
          }}
          aria-label="Next brand"
          className="parts-arrow"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 12h16M14 6l6 6-6 6" />
          </svg>
        </button>
      </div>
      <p className="mt-2 text-center text-[15px] text-cream/60 sm:mt-3 sm:text-lg">Drag to rotate</p>

      {/* full list for screen readers / search engines (the 3D tiles are decorative) */}
      <ul className="sr-only">
        {brands.map((b) => (
          <li key={b.slug}>{b.name}</li>
        ))}
      </ul>
    </div>
  );
}
