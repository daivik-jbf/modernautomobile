import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "./icons";
import { ANNUAL_PLAN, OTHER_PLANS, type Plan } from "@/lib/plans";

function PlanButton({ plan, large }: { plan: Plan; large?: boolean }) {
  return (
    <Link
      href={`/plans/${plan.slug}`}
      className={`group/btn relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-lg bg-brand font-condensed font-semibold uppercase tracking-wide text-white shadow-[0_10px_24px_-10px_rgba(216,25,31,0.8)] transition-[background-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-brand-hover active:translate-y-0 active:scale-[0.99] ${
        large ? "h-10 px-5 text-base sm:h-[46px] sm:px-7 sm:text-xl" : "h-9 px-4 text-base sm:h-10 sm:px-5 sm:text-lg"
      }`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/4 -skew-x-[20deg] bg-white/25 opacity-0 transition-[transform,opacity] duration-700 ease-out group-hover/btn:translate-x-[520%] group-hover/btn:opacity-100"
      />
      <span className="relative">{plan.cta}</span>
      <ArrowRight className="relative size-[18px] transition-transform duration-200 group-hover/btn:translate-x-1.5" />
    </Link>
  );
}

/**
 * "Maintenance plans" — sits directly after the services section on the home page (id="plans").
 * Layout: one tall featured plan on the left, two stacked plans on the right.
 */
export function PlansSection() {
  const a = ANNUAL_PLAN;

  return (
    <section
      id="plans"
      aria-labelledby="plans-heading"
      className="scroll-mt-14 border-t border-white/[0.06] bg-surface sm:scroll-mt-[60px] lg:min-h-[calc(100svh-60px)]"
    >
      <div className="mx-auto flex w-full max-w-[1800px] flex-col justify-center px-5 py-8 sm:px-8 sm:py-12 lg:min-h-[inherit] lg:px-[5%] lg:py-5">
        <div className="reveal" style={{ ["--i" as string]: 0 }}>
          <span className="mb-3 block h-1 w-14 bg-brand sm:mb-4 sm:w-[84px]" aria-hidden="true" />
          <h2
            id="plans-heading"
            className="font-display text-[clamp(1.9rem,8vw,2.4rem)] uppercase sm:text-[clamp(2.75rem,3.8vw,4.25rem)] leading-none tracking-[0.015em] text-cream"
          >
            Maintenance plans
          </h2>
          <p className="mt-1.5 text-[15px] text-cream/90 sm:mt-2 sm:text-lg lg:text-[1.35rem]">
            Choose a service plan for your bike.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:mt-6 sm:gap-4 lg:mt-5 lg:grid-cols-[1.065fr_1fr] lg:gap-[13px]">
          {/* Featured: Annual */}
          <article
            className="reveal group relative isolate flex min-h-[300px] flex-col justify-end sm:min-h-[420px] overflow-hidden rounded-lg border border-white/[0.24] bg-[#131313] transition-[border-color,box-shadow] duration-300 hover:border-brand/70 hover:shadow-[0_18px_44px_-18px_rgba(216,25,31,0.55)] lg:aspect-[820/554] lg:min-h-0"
            style={{ ["--i" as string]: 1 }}
          >
            <Image
              src={a.image.src}
              alt=""
              fill
              sizes="(min-width: 1024px) 46vw, 100vw"
              quality={92}
              className="-z-20 object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.035]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/25 to-transparent"
            />
            <div className="flex flex-col items-start gap-1 p-5 sm:gap-1.5 sm:p-8 lg:p-[3.1%] lg:pb-[3.4%]">
              <h3 className="font-display text-[clamp(1.55rem,7vw,2rem)] uppercase sm:text-[clamp(2.1rem,2.65vw,3rem)] leading-none tracking-[0.015em] text-cream">
                {a.title[0]}
              </h3>
              <p className="mb-2 text-[15px] text-cream/90 sm:mb-3 sm:text-lg lg:text-[1.4rem]">{a.duration}</p>
              <PlanButton plan={a} large />
            </div>
          </article>

          {/* Two stacked plans */}
          <div className="grid gap-4 lg:grid-rows-2 lg:gap-[13px]">
            {OTHER_PLANS.map((p, i) => (
              <article
                key={p.slug}
                className="reveal group relative isolate flex min-h-[150px] items-center overflow-hidden sm:min-h-[220px] lg:min-h-0 rounded-lg border border-white/[0.24] bg-[#131313] transition-[border-color,box-shadow] duration-300 hover:border-brand/70 hover:shadow-[0_18px_44px_-18px_rgba(216,25,31,0.55)]"
                style={{ ["--i" as string]: i + 2 }}
              >
                <Image
                  src={p.image.src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 44vw, 100vw"
                  quality={92}
                  className="-z-20 object-cover object-right transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                {/* keeps text readable when the photo sits behind it on narrow screens */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-[#131313]/90 via-[#131313]/40 to-transparent lg:from-[#131313]/60 lg:via-transparent"
                />
                <div className="flex flex-col items-start gap-1 p-5 sm:gap-1.5 sm:p-8 lg:py-4 lg:pl-[5.5%] lg:pr-0">
                  <h3 className="font-display text-[clamp(1.35rem,6vw,1.7rem)] uppercase sm:text-[clamp(1.8rem,2.45vw,2.8rem)] leading-[1] tracking-[0.015em] text-cream">
                    {p.title.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </h3>
                  <p className="mb-1.5 text-[15px] text-cream/90 sm:mb-2 sm:text-lg lg:text-[1.35rem]">{p.duration}</p>
                  <PlanButton plan={p} />
                </div>
              </article>
            ))}
          </div>
        </div>

        <p
          className="reveal mt-5 text-[15px] text-cream sm:mt-6 sm:text-lg lg:mt-5 lg:text-[1.35rem]"
          style={{ ["--i" as string]: 4 }}
        >
          Need a one-time visit?{" "}
          <Link
            href="/book?service=general-service"
            className="group/link inline-flex items-center gap-2 font-medium text-brand underline decoration-brand/60 underline-offset-4 transition-colors hover:text-[#ff3b41]"
          >
            Book general service
            <ArrowRight className="size-5 transition-transform duration-200 group-hover/link:translate-x-1.5" />
          </Link>
        </p>
      </div>
    </section>
  );
}
