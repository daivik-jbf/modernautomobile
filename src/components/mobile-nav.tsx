"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ChevronDown, MenuIcon } from "./icons";
import { NAV_ITEMS } from "@/lib/nav";

/** Hamburger menu for screens below `lg`. Desktop nav lives in SiteHeader / NavLinks. */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const closeAll = () => {
    setOpen(false);
    setExpanded(null);
  };

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => {
          setOpen((o) => !o);
          setExpanded(null);
        }}
        className="grid size-11 place-items-center rounded-full text-white"
      >
        <MenuIcon open={open} className="size-6" />
      </button>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="animate-fade-up absolute inset-x-0 top-full max-h-[calc(100svh-56px)] overflow-y-auto border-t border-white/10 bg-ink px-5 pb-6 pt-2 shadow-2xl [animation-duration:0.35s]"
        >
          <ul className="flex flex-col">
            {NAV_ITEMS.map((item) => {
              const menu = item.menu;
              const isOpen = expanded === item.href;
              return (
                <li key={item.href} className="border-b border-white/10">
                  {menu ? (
                    <>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={`m-${item.href}`}
                        onClick={() => setExpanded(isOpen ? null : item.href)}
                        className="group/chev flex w-full items-center justify-between py-4 text-left text-lg font-medium text-white"
                      >
                        {item.label}
                        <ChevronDown className="size-5 text-white/80 transition-transform duration-300 ease-out group-aria-expanded/chev:rotate-180" />
                      </button>

                      {/* animated collapse */}
                      <div
                        id={`m-${item.href}`}
                        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        }`}
                        inert={!isOpen}
                      >
                        <ul className="min-h-0 overflow-hidden">
                          {menu.items.map((m) => (
                            <li key={m.href}>
                              <Link
                                href={m.href}
                                onClick={closeAll}
                                className="flex items-center gap-3.5 rounded-lg py-2 pl-1 pr-2 active:bg-white/[0.06]"
                              >
                                <span className="relative h-[42px] w-[64px] shrink-0 overflow-hidden rounded-md border border-white/10 bg-[#0d0d0d]">
                                  <Image
                                    src={m.image.src}
                                    alt=""
                                    fill
                                    sizes="64px"
                                    loading="eager"
                                    unoptimized
                                    style={{ objectPosition: m.image.position }}
                                    className="object-cover"
                                  />
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate font-condensed text-[17px] font-semibold uppercase tracking-wide text-cream">
                                    {m.label}
                                  </span>
                                  {m.sub && <span className="block text-[13px] text-cream/60">{m.sub}</span>}
                                </span>
                              </Link>
                            </li>
                          ))}
                          <li className="pb-3 pt-1">
                            <Link
                              href={menu.viewAll.href}
                              onClick={closeAll}
                              className="inline-flex items-center gap-2 py-2 pl-1 text-[15px] font-medium text-brand"
                            >
                              {menu.viewAll.label}
                              <ArrowRight className="size-[18px]" />
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={closeAll}
                      className="block py-4 text-lg font-medium text-white"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
          <Link
            href="/track"
            onClick={closeAll}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/80 px-5 py-3 text-base font-medium text-white"
          >
            Track booking
            <ArrowRight className="size-4" />
          </Link>
        </nav>
      )}
    </div>
  );
}
