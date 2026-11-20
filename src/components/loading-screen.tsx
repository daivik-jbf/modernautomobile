import Image from "next/image";
import { LogoMark } from "./logo";
import loadingImages from "@/lib/loading-images.json";

const { bike } = loadingImages as Record<"bike", { src: string; width: number; height: number }>;

/**
 * The loading screen: the motorcycle drawing, the Maadan Automobiles lockup, a sliding red progress bar and
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
        {/* brand lockup: official MA mark + divider + wordmark (live text, so the name is always spelled right) */}
        <div className="ld-brand mx-auto mt-4 flex w-full items-center justify-center [container-type:inline-size]" role="img" aria-label="Maadan Automobiles">
          <LogoMark className="h-[7.6cqw]" />
          <span className="mx-[3.4cqw] h-[8.6cqw] w-px bg-[#8d887f]/70" aria-hidden="true" />
          <span aria-hidden="true" className="ld-wordmark whitespace-nowrap text-[7.4cqw] leading-none">
            Maadan Automobiles
          </span>
        </div>
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
