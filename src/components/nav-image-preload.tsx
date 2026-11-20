"use client";

import { useEffect } from "react";
import { NAV_ITEMS } from "@/lib/nav";

/** kept alive so the browser doesn't drop the decoded pictures */
const warm: HTMLImageElement[] = [];

/**
 * Warms the dropdown thumbnails (services + maintenance plans) a moment after the page has loaded, so the
 * pictures are already downloaded and decoded when a menu is opened — on phones the mobile menu is only
 * built when it opens, which used to make the first picture or two pop in late. Renders nothing.
 */
export function NavImagePreload() {
  useEffect(() => {
    const urls = Array.from(new Set(NAV_ITEMS.flatMap((i) => i.menu?.items.map((m) => m.image.src) ?? [])));
    const run = () => {
      for (const src of urls) {
        const img = new window.Image();
        img.decoding = "async";
        img.src = src;
        img.decode().catch(() => {});
        warm.push(img);
      }
    };
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(run, { timeout: 1500 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(run, 600);
    return () => window.clearTimeout(t);
  }, []);
  return null;
}
