/* eslint-disable @next/next/no-html-link-for-pages -- error screens use plain <a>: a full page load is the most reliable way out of an error state (and global-error has no router). */
import Image from "next/image";
import type { ReactNode } from "react";
import { Logo } from "./logo";

/**
 * Shared layout for every error / status screen (404, 500, global error, 503 maintenance, offline).
 * Purely presentational (no hooks) so it can be used from server AND client components, and
 * from global-error where there is no root layout. Uses plain <a> tags on purpose: a full
 * navigation is the most reliable way out of an error state.
 *
 * Images: /public/images/errors/*.webp (made from assets/error_page_images, sharpened + light).
 * Served `unoptimized` so the offline page can cache them as plain static files.
 */

export const BTN_PRIMARY =
  "group/btn relative inline-flex h-12 items-center justify-center overflow-hidden rounded-lg bg-brand px-7 font-condensed text-xl font-semibold tracking-wide text-white shadow-[0_10px_24px_-10px_rgba(216,25,31,0.8)] transition-[background-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-brand-hover active:translate-y-0 active:scale-[0.98] sm:h-14 sm:px-9 sm:text-2xl";

export const BTN_SECONDARY =
  "inline-flex h-12 items-center justify-center rounded-lg border border-white/80 px-7 font-condensed text-xl font-semibold tracking-wide text-white transition-[background-color,color,transform] duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-ink active:translate-y-0 active:scale-[0.98] sm:h-14 sm:px-9 sm:text-2xl";

/** light sweep that runs across the primary button on hover */
export function Sweep() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/4 -skew-x-[20deg] bg-white/25 opacity-0 transition-[transform,opacity] duration-700 ease-out group-hover/btn:translate-x-[520%] group-hover/btn:opacity-100"
    />
  );
}

const HEADER_LINKS = [
  { href: "/#services", label: "Services" },
  { href: "/#plans", label: "Maintenance plans" },
  { href: "/#how-it-works", label: "How it works" },
];

function ErrorHeader() {
  return (
    <header className="relative z-20 bg-ink">
      <div className="flex h-14 items-center justify-between px-5 sm:h-[60px] lg:px-[3%]">
        <a href="/" aria-label="Modern Automobiles — home">
          <Logo />
        </a>
        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex lg:gap-9">
          {HEADER_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-[15px] font-medium text-white/85 transition-colors hover:text-white">
              {l.label}
            </a>
          ))}
          <a
            href="/track"
            className="rounded-md border border-white/80 px-4 py-1.5 text-[15px] font-medium text-white transition-colors hover:bg-white hover:text-ink"
          >
            Track booking
          </a>
        </nav>
        <a
          href="/track"
          className="rounded-md border border-white/80 px-3.5 py-1.5 text-sm font-medium text-white md:hidden"
        >
          Track booking
        </a>
      </div>
    </header>
  );
}

export type ErrorScreenProps = {
  /** "404", "500", "503" — or a word such as "OFFLINE" */
  code: string;
  /** short label after the code, e.g. "Page not found." (empty = code only) */
  label: string;
  title: string;
  body: string;
  image: string;
  /** CSS object-position for the photo, per image focus */
  focus?: string;
  /** pulsing dot instead of a plain bullet (status screens: maintenance / offline) */
  live?: boolean;
  /** buttons / links */
  children?: ReactNode;
  /** extra status line under the buttons */
  footer?: ReactNode;
};

export function ErrorScreen({
  code,
  label,
  title,
  body,
  image,
  focus = "center",
  live,
  children,
  footer,
}: ErrorScreenProps) {
  const words = title.split(" ");
  const eyebrowDelay = 160;

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-[#0b0b0b] text-cream">
      <ErrorHeader />

      <main className="relative isolate flex flex-1 flex-col lg:flex-row lg:items-center">
        {/* photo — right side on desktop, top on phones */}
        <div className="absolute inset-x-0 top-0 -z-10 h-[78vw] overflow-hidden lg:inset-y-0 lg:left-auto lg:right-0 lg:h-auto lg:w-[60%]">
          <div className="err-drift absolute inset-0">
            <Image
              src={image}
              alt=""
              fill
              unoptimized
              priority
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="animate-photo-in object-cover"
              style={{ objectPosition: focus }}
            />
          </div>
          {/* desktop: melt the photo into the dark page on its left edge */}
          <div className="absolute inset-0 hidden bg-gradient-to-r from-[#0b0b0b] from-0% via-[#0b0b0b]/50 via-11% to-transparent to-30% lg:block" />
          {/* phones: fade the photo down into the content */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 from-35% to-[#0b0b0b] to-100% lg:hidden" />
        </div>

        <div className="relative z-10 w-full px-5 pb-12 pt-[66vw] sm:px-8 lg:max-w-[58%] lg:px-0 lg:py-16 lg:pl-[4%] lg:pt-16">
          {/* eyebrow: code + label */}
          <p className="flex items-center gap-2.5 font-condensed text-[clamp(1.25rem,2vw,2.2rem)] font-medium leading-none tracking-wide">
            <span
              aria-label={/^\d+$/.test(code) ? `Error ${code}` : code}
              className="flex font-semibold text-brand-logo"
            >
              {code.split("").map((d, i) => (
                <span key={i} aria-hidden="true" className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                  <span className="err-rise inline-block" style={{ animationDelay: `${i * 90}ms` }}>
                    {d}
                  </span>
                </span>
              ))}
            </span>
            {label && (
              <>
                {live ? (
                  <span aria-hidden="true" className="relative inline-flex size-2.5">
                    <span className="absolute inset-0 animate-ping rounded-full bg-brand-logo/70" />
                    <span className="relative size-2.5 rounded-full bg-brand-logo" />
                  </span>
                ) : (
                  <span aria-hidden="true" className="text-cream/80">
                    •
                  </span>
                )}
                <span className="animate-fade-up text-cream" style={{ animationDelay: `${eyebrowDelay}ms` }}>
                  {label}
                </span>
              </>
            )}
          </p>

          {/* title — words slide up */}
          <h1 className="mt-4 font-condensed text-[clamp(2.6rem,5.2vw,5.6rem)] font-semibold leading-[1.04] tracking-[0.005em] text-cream sm:mt-5">
            <span className="sr-only">{title}</span>
            {words.map((w, i) => (
              <span key={i} aria-hidden="true" className="inline-block overflow-hidden pb-[0.12em] align-bottom">
                <span className="err-rise inline-block" style={{ animationDelay: `${220 + i * 90}ms` }}>
                  {w}
                  {i < words.length - 1 ? " " : ""}
                </span>
              </span>
            ))}
          </h1>

          <p
            className="animate-fade-up mt-4 max-w-[38rem] text-[clamp(1.05rem,1.7vw,1.85rem)] leading-snug text-cream/90 sm:mt-5"
            style={{ animationDelay: "520ms" }}
          >
            {body}
          </p>

          {children && (
            <div className="animate-fade-up mt-7 flex flex-wrap items-center gap-3 sm:mt-9 sm:gap-4" style={{ animationDelay: "680ms" }}>
              {children}
            </div>
          )}

          {footer && (
            <div className="animate-fade-up mt-5 text-[15px] text-cream/70 sm:mt-6" style={{ animationDelay: "840ms" }}>
              {footer}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
