"use client";

import { useEffect, useState } from "react";
import { LoadingScreen } from "./loading-screen";

const MIN_MS = 2100; // the screen is always on for at least this long (measured from the start of the page load)
const MIN_MS_REDUCED = 500;
const MAX_MS = 5000; // never hold the visitor longer than this, even on a very slow connection
const EXIT_MS = 1000; // length of the curtain-up exit (keep in sync with `.splash` in globals.css)

/**
 * First-visit splash: the loading screen covers the home page from the very first paint (it is part of the
 * server HTML, so there is no flash of the page behind it) and lifts away like a curtain once the page has
 * loaded — after a minimum of MIN_MS so the animation is seen, and never later than MAX_MS.
 */
export function Splash() {
  const [phase, setPhase] = useState<"show" | "leaving" | "gone">("show");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const min = reduced ? MIN_MS_REDUCED : MIN_MS;
    let leave = 0;
    let finish = 0;
    const start = () => {
      leave = window.setTimeout(() => {
        setPhase("leaving");
        finish = window.setTimeout(() => setPhase("gone"), reduced ? 50 : EXIT_MS);
      }, Math.max(0, min - performance.now()));
    };
    let loaded = document.readyState === "complete";
    if (loaded) start();
    const onLoad = () => {
      if (loaded) return;
      loaded = true;
      window.clearTimeout(cap);
      start();
    };
    const cap = window.setTimeout(onLoad, MAX_MS);
    window.addEventListener("load", onLoad);
    return () => {
      window.removeEventListener("load", onLoad);
      window.clearTimeout(cap);
      window.clearTimeout(leave);
      window.clearTimeout(finish);
    };
  }, []);

  if (phase === "gone") return null;
  return (
    <div className="splash" data-leaving={phase === "leaving"} role="presentation" aria-hidden={phase === "leaving" || undefined}>
      <noscript>
        <style>{".splash{display:none!important}"}</style>
      </noscript>
      <LoadingScreen />
    </div>
  );
}
