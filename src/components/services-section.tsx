import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "./icons";
import { FEATURED_SERVICE, SERVICES } from "@/lib/services";

/**
 * "Bike services" — sits directly below the hero on the home page (id="services").
 * Cards reveal on scroll using CSS scroll-driven animations (see `.reveal` in globals.css);
 * browsers without support simply show everything.
 */
export function ServicesSection() {
  const f = FEATURED_SERVICE;

  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="scroll-mt-14 bg-surface sm:scroll-mt-[60px] lg:min-h-[calc(100svh-60px)]"
    >
      <div className="mx-auto flex w-full max-w-[1800px] flex-col justify-center px-5 py-8 sm:px-8 sm:py-12 lg:min-h-[inherit] lg:px-[5%] lg:py-7">
        <div className="reveal" style={{ ["--i" as string]: 0 }}>
          <span className="mb-3 block h-1 w-14 bg-brand sm:mb-4 sm:w-[84px]" aria-hidden="true" />
          <h2
            id="services-heading"
            className="font-display text-[clamp(1.9rem,8vw,2.4rem)] uppercase sm:text-[clamp(2.75rem,3.8vw,4.25rem)] leading-none tracking-[0.015em] text-cream"
          >
            Bike services
          </h2>
        </div>

        {/* Featured: General service */}
        <article
          className="reveal group relative mt-5 isolate overflow-hidden rounded-lg border border-white/[0.24] bg-[#1a1a1b] transition-[border-color,box-shadow] duration-300 hover:border-brand/70 hover:shadow-[0_18px_44px_-18px_rgba(216,25,31,0.55)] lg:mt-7"
          style={{ ["--i" as string]: 1 }}
        >
          <div className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-full lg:w-[72%] [mask-image:linear-gradient(to_right,transparent,#000_38%)]">
            <Image
              src={f.image.src}
              alt=""
              fill
              sizes="(min-width: 1024px) 72vw, 100vw"
              unoptimized
              className="object-cover object-right transition-transform duration-700 ease-out group-hover:scale-[1.035]"
            />
          </div>
          {/* keeps the text readable on narrow screens where the photo sits behind it */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-[#1a1a1b] via-[#1a1a1b]/70 to-transparent lg:via-[#1a1a1b]/20"
          />

          <div className="flex min-h-[190px] flex-col items-start justify-center gap-3 px-5 py-6 sm:min-h-[250px] sm:gap-5 sm:px-9 sm:py-8 lg:min-h-[262px] lg:px-11">
            <h3 className="font-display text-[clamp(1.75rem,7.4vw,2.2rem)] uppercase sm:text-[clamp(2.5rem,3.4vw,3.75rem)] leading-none tracking-[0.015em] text-cream">
              {f.title}
            </h3>
            <p className="max-w-[26rem] text-[15px] leading-snug text-cream/90 sm:text-lg lg:text-[1.35rem]">
              {f.blurb}
            </p>
            <Link
              href={`/book?service=${f.slug}`}
              className="group/btn relative inline-flex h-10 items-center justify-center gap-2.5 overflow-hidden rounded-lg bg-brand px-6 font-condensed text-base sm:h-[52px] sm:gap-3 sm:px-10 sm:text-xl font-semibold uppercase tracking-wide text-white shadow-[0_10px_24px_-10px_rgba(216,25,31,0.8)] transition-[background-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-brand-hover active:translate-y-0 active:scale-[0.99]"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/4 -skew-x-[20deg] bg-white/25 opacity-0 transition-[transform,opacity] duration-700 ease-out group-hover/btn:translate-x-[520%] group-hover/btn:opacity-100"
              />
              <span className="relative">{f.cta}</span>
              <ArrowRight className="relative size-5 transition-transform duration-200 group-hover/btn:translate-x-1.5" />
            </Link>
          </div>
        </article>

        {/* Service tiles */}
        <ul className="mt-3 grid grid-cols-1 gap-3 sm:mt-5 sm:grid-cols-2 sm:gap-[18px] lg:mt-7 lg:grid-cols-4 lg:gap-x-6">
          {SERVICES.map((s, i) => (
            <li key={s.slug} className="reveal" style={{ ["--i" as string]: Math.min(i % 4, 3) + 2 }}>
              <Link
                href={`/book?service=${s.slug}`}
                aria-label={s.title.join(" ")}
                className="group relative isolate flex h-[88px] items-center sm:h-[126px] overflow-hidden rounded-lg border border-white/[0.22] bg-gradient-to-br from-[#1a1a1b] via-[#202021] to-[#2a2a2b] shadow-[0_1px_0_rgba(255,255,255,0.05)_inset] transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-brand/70 hover:shadow-[0_16px_34px_-16px_rgba(216,25,31,0.6)] active:translate-y-0 active:scale-[0.985] active:border-brand/70"
              >
                <div className="pointer-events-none absolute inset-y-0 right-0 -z-10 [mask-image:linear-gradient(to_right,transparent,#000_30%)]">
                  <Image
                    src={s.image.src}
                    alt=""
                    width={s.image.width}
                    height={s.image.height}
                    unoptimized
                    className="h-full w-auto max-w-none origin-right transition-transform duration-500 ease-out group-hover:scale-[1.07] group-active:scale-[1.07]"
                  />
                </div>
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-brand transition-transform duration-300 ease-out group-hover:scale-x-100 group-active:scale-x-100"
                />
                <h3 className="relative pl-4 font-display text-[1.2rem] uppercase sm:pl-7 sm:text-[1.6rem] leading-[1.08] tracking-[0.03em] text-cream">
                  {s.title.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </h3>
              </Link>
            </li>
          ))}
        </ul>

        <p className="reveal mt-5 text-[15px] text-cream sm:mt-6 sm:text-lg lg:mt-7 lg:text-[1.35rem]" style={{ ["--i" as string]: 6 }}>
          Looking for scheduled care?{" "}
          <Link
            href="/#plans"
            className="group/link inline-flex items-center gap-2 font-medium text-brand underline decoration-brand/60 underline-offset-4 transition-colors hover:text-[#ff3b41]"
          >
            Explore maintenance plans
            <ArrowRight className="size-5 transition-transform duration-200 group-hover/link:translate-x-1.5" />
          </Link>
        </p>
      </div>
    </section>
  );
}
