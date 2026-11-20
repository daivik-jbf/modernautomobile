import Image from "next/image";
import loadingImages from "@/lib/loading-images.json";

const { bike, brand } = loadingImages as Record<"bike" | "brand", { src: string; width: number; height: number }>;

/**
 * The loading screen: the motorcycle drawing, the Modern Automobiles lockup, a sliding red progress bar and
 * "Loading…" on near-black. Used as the first-visit splash (components/splash.tsx) and as the route
 * loading state (app/loading.tsx). All motion is CSS (see `.ld-*` in globals.css).
 */
export function LoadingScreen() {
  return (
    <div className="ld-screen relative grid min-h-svh w-full place-items-center overflow-hidden px-4">
      {/* soft vignette, like the design */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.55)_100%)]" />

      <main className="relative w-[min(88vw,760px)] text-center">
        <Image
          src={bike.src}
          alt=""
          width={bike.width}
          height={bike.height}
          unoptimized
          loading="eager"
          fetchPriority="high"
          className="ld-bike mx-auto block h-auto w-[74%]"
        />
        <Image
          src={brand.src}
          alt="Modern Automobiles"
          width={brand.width}
          height={brand.height}
          unoptimized
          loading="eager"
          fetchPriority="high"
          className="ld-brand mx-auto block h-auto w-full"
        />
        <div className="ld-track mx-auto mb-3 mt-7 h-[3px] w-[53%] overflow-hidden bg-[#383838] sm:mt-9" aria-hidden="true">
          <i className="ld-bar block h-full w-[32%] bg-[#df1525]" />
        </div>
        <span role="status" className="ld-text block text-[clamp(15px,1.35vw,21px)] font-medium tracking-wide text-[#f4f0e8]">
          Loading…
        </span>
      </main>
    </div>
  );
}
