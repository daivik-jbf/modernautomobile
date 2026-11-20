import { Suspense } from "react";
import { RevealFallback } from "@/components/reveal-fallback";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ToolboxLogin } from "@/components/toolbox-login";

export const metadata = {
  title: "Rider login",
  description: "Sign in with your mobile number to see your bookings, quotes and service history.",
};

/**
 * Rider login (/login?next=/somewhere). The page chrome — header, heading, footer — is live HTML; the workshop
 * picture and the toolbox drawer live in <ToolboxLogin /> (see its doc comment for how the layers work).
 */
export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <RevealFallback />
      <main className="flex flex-1 flex-col">
        <section
          aria-labelledby="login-heading"
          className="relative overflow-x-clip bg-[#1b1c1e] xl:flex xl:min-h-[calc(100svh-60px)] xl:items-center"
        >
          {/* heading column */}
          <div className="relative z-10 px-5 pb-6 pt-9 sm:px-8 sm:pt-12 lg:pl-[4.2vw] xl:w-[36%] xl:pb-0 xl:pt-0 xl:pr-0">
            <h1
              id="login-heading"
              className="reveal font-display text-[clamp(2.6rem,12vw,4.4rem)] uppercase leading-[0.98] tracking-[0.005em] text-cream xl:text-[clamp(3.2rem,min(6.4vw,12vh),7rem)]"
            >
              Rider
              <br />
              login
            </h1>
            <p
              className="reveal mt-4 max-w-[26rem] text-[16px] leading-snug text-cream/90 sm:text-lg xl:mt-5 xl:text-[clamp(1.05rem,1.5vw,1.75rem)]"
              style={{ ["--i" as string]: 1 }}
            >
              Access your bookings, quotes and service history.
            </p>
            <span className="reveal mt-5 block h-1 w-14 bg-brand sm:w-[84px] xl:mt-6" style={{ ["--i" as string]: 2 }} aria-hidden="true" />
          </div>

          {/* the workshop: below the heading on phones/tablets, right-hand side on large screens */}
          <div className="relative w-full xl:absolute xl:right-0 xl:top-1/2 xl:w-[min(calc((100svh-60px)*1.431),72vw)] xl:-translate-y-1/2">
            <Suspense fallback={<div className="aspect-[940/790] w-full" aria-hidden="true" />}>
              <ToolboxLogin />
            </Suspense>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
