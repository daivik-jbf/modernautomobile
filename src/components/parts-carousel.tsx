"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";
import type { Brand } from "@/lib/parts";

const CRUISE_MS_PER_BRAND = 5200; // the ring turns by itself, smoothly, at this pace (time for one brand to pass the front)
const IDLE_MS = 2200; // how long after the visitor lets go before the ring starts turning by itself again
const FLING_MAX = 0.26; // deg/ms: fastest a swipe can throw the ring (keeps brands passing one after another, in order)

type Ease = (t: number) => number;
/** soft start AND soft finish: no snap at the beginning of a move */
const easeInOutCubic: Ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const mod = (a: number, n: number) => ((a % n) + n) % n;

/**
 * 3D circular carousel ("cylinder" of brand tiles).
 *  - Drag / swipe to spin (the front surface follows your finger); on release it keeps its momentum and
 *    glides to rest on a brand (critically-damped spring: no sudden stop, never more than two brands away).
 *  - Arrow buttons, ← → keys, or click a side tile to bring it to the front.
 *  - While on screen it turns by itself at a steady, smooth pace (speeding up / slowing down gently, never
 *    jumping); it pauses while the mouse is over it and resumes shortly after a visitor lets go.
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
  const vel = useRef(0); // current angular speed, deg/ms (negative = towards the next brand)
  const snap = useRef<number | null>(null); // angle the ring is settling onto after a release
  const animating = useRef(false); // an eased move (arrows / click / intro) is in charge of the angle

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
    animating.current = false;
    snap.current = null;
    vel.current = 0;
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
      animating.current = true;
      const t0 = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / ms);
        angle.current = from + (target - from) * ease(t);
        render();
        if (t < 1) raf.current = requestAnimationFrame(tick);
        else {
          raf.current = 0;
          animating.current = false;
          vel.current = 0;
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
  const goBy = useCallback(
    (dir: 1 | -1) => {
      const target = Math.round(angle.current / step) * step + dir * step;
      animateTo(target, Math.min(1000, 650 + Math.abs(target - angle.current) * 8));
    },
    [animateTo, step],
  );
  const goNext = useCallback(() => goBy(-1), [goBy]);
  const goPrev = useCallback(() => goBy(1), [goBy]);
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

  // The motion loop (runs while the carousel is on screen). One place decides how the ring moves when nobody is
  // dragging it and no eased move is running:
  //  - settling after a release: critically-damped spring onto the chosen brand (keeps the swipe's momentum),
  //  - turning by itself: speed eases up to a calm cruise and back down, so nothing ever jumps,
  //  - paused (mouse over it): comes to rest centred on a brand.
  useEffect(() => {
    if (!inView) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cruise = -step / CRUISE_MS_PER_BRAND;
    const omega = (2 * Math.PI) / 1100; // spring stiffness: about one second to settle
    let last = performance.now();
    let id = 0;
    function frame(t: number) {
      id = requestAnimationFrame(frame);
      const dt = Math.min(40, Math.max(1, t - last));
      last = t;
      if (animating.current || drag.current || introRunning.current) return;

      let a = angle.current;
      let v = vel.current;
      const canCruise = !reduced && !hovering.current && t - lastTouch.current > IDLE_MS;

      if (snap.current === null && !canCruise) {
        const rest = Math.round((a + v * 350) / step) * step;
        if (Math.abs(v) > 0.0004 || Math.abs(a - rest) > 0.05) snap.current = rest;
      }

      if (snap.current !== null) {
        const x = a - snap.current;
        v += (-omega * omega * x - 2 * omega * v) * dt;
        a += v * dt;
        if (Math.abs(x) < 0.03 && Math.abs(v) < 0.0006) {
          a = snap.current;
          v = 0;
          snap.current = null;
        }
      } else if (canCruise) {
        v += (cruise - v) * (1 - Math.exp(-dt / 600));
        a += v * dt;
      }

      vel.current = v;
      if (a !== angle.current) {
        angle.current = a;
        render();
      }
    }
    id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, [inView, step, render]);

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
      // keep the swipe's momentum (clamped) and glide to rest on a brand - never more than two brands from where
      // the finger left it, so brands keep passing the front one after another, in order
      const v = performance.now() - d.t > 90 ? 0 : Math.max(-FLING_MAX, Math.min(FLING_MAX, d.v));
      const base = Math.round(angle.current / step) * step;
      const rest = Math.max(base - 2 * step, Math.min(base + 2 * step, Math.round((angle.current + v * 350) / step) * step));
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        angle.current = rest;
        vel.current = 0;
        render();
      } else {
        vel.current = v;
        snap.current = rest;
      }
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
        onFocus={(e) => {
          if (e.currentTarget.matches(":focus-visible")) hovering.current = true; // keyboard focus only (a tap also focuses it)
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

      {/* full list for screen readers / search engines (the 3D tiles are decorative) */}
      <ul className="sr-only">
        {brands.map((b) => (
          <li key={b.slug}>{b.name}</li>
        ))}
      </ul>
    </div>
  );
}
