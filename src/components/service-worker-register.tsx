"use client";

import { useEffect } from "react";

/**
 * Registers /sw.js (production only) so visitors who lose their connection see the branded
 * "You're offline" page instead of the browser's dino. Renders nothing.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    const register = () => navigator.serviceWorker.register("/sw.js").catch(() => {});
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  return null;
}
