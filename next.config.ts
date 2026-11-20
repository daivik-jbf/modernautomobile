import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // Every picture on the site is pre-built (scripts/build-*-images.cjs) and served as a static file, so the
    // on-demand image optimizer is not used. This only matters if someone adds a plain <Image> later.
    qualities: [75, 92],
  },
  async headers() {
    // Picture files whose names contain a content hash can never change, so browsers and the CDN may keep
    // them for a year (repeat visits and navigation then load them instantly from cache).
    const immutable = "public, max-age=31536000, immutable";
    return [
      { source: "/images/:dir(hero|how|parts|services|plans|app|about|footer|loading|toolbox)/:file*", headers: [{ key: "Cache-Control", value: immutable }] },
      // error-screen pictures are not hashed: cache for a day, refresh quietly in the background
      { source: "/images/errors/:file*", headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }] },
    ];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
