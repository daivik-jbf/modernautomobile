import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUp } from "./icons";
import { LogoMark } from "./logo";
import { FOOTER_COLUMNS, FOOTER_TAGLINE, FOOTER_BIKE } from "@/lib/footer";

/**
 * Site footer: brand + tagline, three link columns with the motorcycle drawing, and a
 * copyright / "Back to top" strip. Everything slides in on scroll (CSS only); the bike rolls in from the right.
 */
export function SiteFooter() {
  return (
    <footer id="site-footer" className="relative overflow-x-clip border-t border-white/10 bg-footer">
      <div className="mx-auto w-full max-w-[1920px] px-5 sm:px-8 lg:px-[4%]">
        {/* ---------- brand row ---------- */}
        <div className="reveal flex flex-col gap-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:py-8 lg:py-9">
          <Link href="/" aria-label="Maadan Automobiles — home" className="flex items-center gap-4 sm:gap-5">
            <LogoMark className="h-[28px] sm:h-[36px] lg:h-[clamp(2.4rem,3.4vw,3.8rem)]" />
            <span className="h-[clamp(2.6rem,4vw,4.2rem)] w-px bg-white/45" aria-hidden="true" />
            <span className="flex flex-col">
              <span className="font-condensed text-[1.2rem] font-bold uppercase leading-none tracking-[0.12em] text-cream sm:text-[1.7rem] lg:text-[clamp(1.6rem,2.5vw,2.8rem)]">
                Maadan Automobiles
              </span>
              <span className="mt-1.5 text-[13px] text-cream/90 sm:text-base lg:text-[clamp(1rem,1.5vw,1.7rem)]">{FOOTER_TAGLINE}</span>
            </span>
          </Link>
        </div>

        <div className="h-px bg-white/15" aria-hidden="true" />

        {/* ---------- links + bike ---------- */}
        <div className="relative grid gap-x-6 gap-y-9 py-9 sm:py-11 md:grid-cols-3 lg:grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,1.15fr)] lg:py-[clamp(1.5rem,5vh,3.25rem)]">
          {FOOTER_COLUMNS.map((col, ci) => (
            <nav key={col.title} aria-label={col.title} className="reveal" style={{ ["--i" as string]: ci + 1 }}>
              <h2 className="font-condensed text-[1.35rem] font-bold uppercase leading-none tracking-[0.04em] text-cream sm:text-[1.6rem] lg:text-[clamp(1.4rem,1.9vw,2.1rem)]">
                {col.title}
              </h2>
              <ul className="mt-4 space-y-2.5 sm:mt-5 sm:space-y-3 lg:space-y-[clamp(0.5rem,1.4vh,0.9rem)]">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="footer-link inline-flex items-center gap-2.5 text-[15px] text-cream/85 sm:text-base lg:text-[clamp(1rem,1.2vw,1.35rem)]">
                      {l.label}
                    </Link>
                  </li>
                ))}
                {col.more && (
                  <li className="pt-1">
                    <Link href={col.more.href} className="footer-link group/more inline-flex items-center gap-2.5 text-[15px] text-cream sm:text-base lg:text-[clamp(1rem,1.2vw,1.35rem)]">
                      {col.more.label}
                      <ArrowRight className="size-[1.1em] transition-transform duration-300 group-hover/more:translate-x-1.5" />
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          ))}

          {/* the bike rolls in from the right; sits at the bottom-right of the block */}
          <div className="footer-bike relative -mb-3 mt-2 flex items-end justify-center md:col-span-3 lg:col-span-1 lg:mt-0 lg:justify-end" aria-hidden="true">
            <Image
              src={FOOTER_BIKE.src}
              alt=""
              width={FOOTER_BIKE.width}
              height={FOOTER_BIKE.height}
              unoptimized
              className="footer-bike-img h-auto w-[min(78vw,320px)] sm:w-[340px] lg:w-full lg:max-w-[440px]"
            />
          </div>
        </div>

        <div className="h-px bg-white/15" aria-hidden="true" />

        {/* ---------- bottom strip ---------- */}
        <div className="flex items-center justify-between py-5 text-[14px] text-cream/80 sm:py-6 sm:text-base lg:text-[clamp(0.95rem,1.1vw,1.2rem)]">
          <p>© Maadan Automobiles</p>
          <a href="#" className="footer-link group/top inline-flex items-center gap-2 text-cream/90">
            Back to top
            <ArrowUp className="size-[1.15em] transition-transform duration-300 group-hover/top:-translate-y-1" />
          </a>
        </div>
      </div>
    </footer>
  );
}
