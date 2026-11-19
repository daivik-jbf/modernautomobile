import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Maintenance mode. Set MAINTENANCE_MODE=1 (e.g. in .env.local or the hosting dashboard) and every
 * request is answered with the branded maintenance screen and a real HTTP 503 + `Retry-After`
 * (so search engines and uptime monitors know it is temporary), until you unset it.
 * The health check, static assets, the offline page and the maintenance page itself stay reachable.
 */
const PASS_THROUGH = [
  /^\/maintenance/,
  /^\/offline/, // the service worker caches this page; it must never be swapped for the 503 screen
  /^\/api\/health/,
  /^\/images\//,
  /^\/sw\.js$/,
  /\.(?:png|jpe?g|webp|avif|svg|ico|woff2?|css|js|map|txt)$/,
];

const HEADERS = {
  "Retry-After": "300",
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex",
};

export async function proxy(request: NextRequest) {
  if (process.env.MAINTENANCE_MODE !== "1") return NextResponse.next();

  const { pathname, origin } = request.nextUrl;
  if (PASS_THROUGH.some((re) => re.test(pathname))) return NextResponse.next();

  // anything that isn't a page load (forms, API calls…) just gets a plain 503
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new NextResponse("Service unavailable", { status: 503, headers: HEADERS });
  }

  // A rewrite can't change the status code, so fetch the maintenance page and serve it as a 503.
  try {
    const page = await fetch(`${origin}/maintenance`, { cache: "no-store" });
    return new NextResponse(request.method === "HEAD" ? null : page.body, {
      status: 503,
      headers: { ...HEADERS, "Content-Type": "text/html; charset=utf-8" },
    });
  } catch {
    return new NextResponse("Service unavailable", { status: 503, headers: HEADERS });
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
