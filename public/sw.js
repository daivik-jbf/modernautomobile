/*
 * Maadan Automobiles — offline service worker.
 * Purpose: when a page can't be loaded because the visitor has no connection, show the branded
 * /offline screen instead of the browser's error. Nothing else is cached or changed:
 *  - page navigations always go to the network first;
 *  - only the offline screen + its assets are pre-cached, and hashed /_next/static files are
 *    cached on use (they are immutable, so this is safe).
 * Bump VERSION to force clients to refresh the cache.
 */
const VERSION = "v1";
const CACHE = `ma-offline-${VERSION}`;
const OFFLINE_URL = "/offline";
const EXTRA = ["/images/errors/offline.webp", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      const res = await fetch(OFFLINE_URL, { cache: "reload" });
      if (!res.ok) throw new Error("offline page unavailable");
      const html = await res.clone().text();
      await cache.put(OFFLINE_URL, res);

      // everything the offline screen needs to render: its scripts, styles and font preloads
      const urls = new Set(EXTRA);
      for (const m of html.matchAll(/(?:href|src)="(\/_next\/static\/[^"]+)"/g)) urls.add(m[1]);
      for (const u of urls) {
        try {
          await cache.add(u);
        } catch {
          /* a missing optional asset must not break installation */
        }
      }
      // fonts are referenced from inside the CSS files
      for (const u of urls) {
        if (!u.split("?")[0].endsWith(".css")) continue;
        try {
          const css = await (await cache.match(u)).text();
          for (const f of css.matchAll(/url\(["']?(\/_next\/static\/media\/[^)"']+)/g)) {
            try {
              await cache.add(f[1]);
            } catch {
              /* ignore */
            }
          }
        } catch {
          /* ignore */
        }
      }
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k.startsWith("ma-offline-") && k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Page loads: network first; if there is no connection, show the offline screen.
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          return await fetch(req);
        } catch {
          const cache = await caches.open(CACHE);
          return (await cache.match(OFFLINE_URL)) || Response.error();
        }
      })(),
    );
    return;
  }

  // Immutable build assets + the offline screen's artwork: cache-first.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/images/errors/")) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        const hit = await cache.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      })(),
    );
  }
});
