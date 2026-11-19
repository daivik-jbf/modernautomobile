"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ArrowRight, ChevronDown } from "./icons";
import { NAV_ITEMS, type NavItem } from "@/lib/nav";

/**
 * Desktop nav.
 * - Scroll-spy: the link whose section is on screen gets a red underline.
 * - Dropdowns: open/close on CLICK only (no hover). Esc, outside click, or focus leaving closes them.
 */
export function NavLinks() {
  const [active, setActive] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const ids = NAV_ITEMS.map((l) => l.href.split("#")[1]);
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (els.length === 0) return;

    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        }
        setActive(ids.find((id) => visible.has(id)) ?? null);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <ul className="flex h-full items-stretch gap-8 lg:gap-12">
      {NAV_ITEMS.map((item) => (
        <NavEntry
          key={item.href}
          item={item}
          isActive={active === item.href.split("#")[1]}
          openId={openId}
          setOpenId={setOpenId}
        />
      ))}
    </ul>
  );
}

function NavEntry({
  item,
  isActive,
  openId,
  setOpenId,
}: {
  item: NavItem;
  isActive: boolean;
  openId: string | null;
  setOpenId: (id: string | null) => void;
}) {
  const uid = useId();
  const id = item.href;
  const open = openId === id;
  const rootRef = useRef<HTMLLIElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpenId(null), [setOpenId]);

  // outside click (touch) + Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const focusItem = (dir: 1 | -1 | "first" | "last") => {
    const links = Array.from(panelRef.current?.querySelectorAll<HTMLAnchorElement>("a") ?? []);
    if (links.length === 0) return;
    const i = links.indexOf(document.activeElement as HTMLAnchorElement);
    const next =
      dir === "first" ? 0 : dir === "last" ? links.length - 1 : (i + dir + links.length) % links.length;
    links[next].focus();
  };

  const menu = item.menu;

  return (
    <li
      ref={rootRef}
      className="relative flex"
      onBlur={(e) => {
        if (menu && !rootRef.current?.contains(e.relatedTarget as Node)) close();
      }}
    >
      <div className="relative flex items-center">
        {menu ? (
          <button
            ref={triggerRef}
            type="button"
            aria-expanded={open}
            aria-haspopup="true"
            aria-controls={`${uid}-panel`}
            aria-current={isActive ? "location" : undefined}
            onClick={() => (open ? close() : setOpenId(id))}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setOpenId(id);
                window.setTimeout(() => focusItem("first"), 30);
              }
            }}
            className={`group/chev flex h-full cursor-pointer items-center gap-1 px-1 text-[15px] font-medium transition-colors duration-200 hover:text-white ${
              isActive || open ? "text-white" : "text-white/80"
            }`}
          >
            {item.label}
            <ChevronDown className="size-4 transition-transform duration-300 ease-out group-aria-expanded/chev:rotate-180" />
          </button>
        ) : (
          <Link
            href={item.href}
            aria-current={isActive ? "location" : undefined}
            className={`flex h-full items-center px-1 text-[15px] font-medium transition-colors duration-200 hover:text-white ${
              isActive ? "text-white" : "text-white/80"
            }`}
          >
            {item.label}
          </Link>
        )}

        <span
          aria-hidden="true"
          className={`absolute inset-x-0 bottom-0 h-[3px] origin-center bg-brand-logo transition-transform duration-300 ease-out ${
            isActive || open ? "scale-x-100" : "scale-x-0"
          }`}
        />
      </div>

      {menu && (
        <div
          data-open={open}
          className="pointer-events-none absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3 data-[open=true]:pointer-events-auto"
        >
          <div
            ref={panelRef}
            id={`${uid}-panel`}
            data-open={open}
            onKeyDown={(e) => {
              const move =
                e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : e.key === "Home" ? "first" : e.key === "End" ? "last" : null;
              if (move === null) return;
              e.preventDefault();
              focusItem(move);
            }}
            className={`nav-panel overflow-hidden rounded-xl border border-white/10 bg-[#141414] shadow-[0_28px_60px_-12px_rgba(0,0,0,0.75)] ring-1 ring-black/50 ${
              menu.columns === 2 ? "w-[580px]" : "w-[380px]"
            }`}
          >
            {/* red accent line */}
            <span aria-hidden="true" className="block h-[3px] bg-gradient-to-r from-brand via-brand-logo to-brand/0" />

            <div className="p-3">
              <p className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cream/55">
                {menu.title}
              </p>

              <ul className={`grid gap-1 ${menu.columns === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
                {menu.items.map((m, i) => {
                  const wide = menu.columns === 2 && i === 0;
                  return (
                    <li
                      key={m.href}
                      className={wide ? "col-span-2" : undefined}
                      style={{ ["--i" as string]: i }}
                    >
                      <Link
                        href={m.href}
                        onClick={close}
                        tabIndex={open ? 0 : -1}
                        className="nav-item group/item relative flex items-center gap-3.5 rounded-lg p-2 pr-3 outline-none transition-colors duration-200 hover:bg-white/[0.06] focus-visible:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-cream/70"
                      >
                        <span
                          className={`relative shrink-0 overflow-hidden rounded-md border border-white/10 bg-[#0d0d0d] ${
                            menu.columns === 1 ? "h-[52px] w-[84px]" : wide ? "h-12 w-[88px]" : "h-[42px] w-[64px]"
                          }`}
                        >
                          <Image
                            src={m.image.src}
                            alt=""
                            fill
                            sizes="96px"
                            quality={92}
                            style={{ objectPosition: m.image.position }}
                            className="object-cover transition-transform duration-500 ease-out group-hover/item:scale-110"
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={`block truncate font-condensed font-semibold uppercase tracking-wide text-cream transition-colors group-hover/item:text-white ${
                              menu.columns === 1 || wide ? "text-[19px]" : "text-[16.5px]"
                            }`}
                          >
                            {m.label}
                          </span>
                          {m.sub && <span className="block text-[13px] text-cream/60">{m.sub}</span>}
                        </span>
                        <ArrowRight className="size-[18px] shrink-0 -translate-x-1.5 text-brand opacity-0 transition-[transform,opacity] duration-200 ease-out group-hover/item:translate-x-0 group-hover/item:opacity-100 group-focus-visible/item:translate-x-0 group-focus-visible/item:opacity-100" />
                        {/* red marker */}
                        <span
                          aria-hidden="true"
                          className="absolute inset-y-2.5 left-0 w-[3px] origin-center scale-y-0 rounded-full bg-brand transition-transform duration-200 group-hover/item:scale-y-100 group-focus-visible/item:scale-y-100"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <Link
                href={menu.viewAll.href}
                onClick={close}
                tabIndex={open ? 0 : -1}
                className="nav-item group/all mt-2 flex items-center justify-between rounded-lg border-t border-white/[0.08] px-3 pb-1.5 pt-3.5 text-[15px] font-medium text-brand outline-none transition-colors hover:text-[#ff3b41] focus-visible:ring-2 focus-visible:ring-cream/70"
                style={{ ["--i" as string]: menu.items.length }}
              >
                {menu.viewAll.label}
                <ArrowRight className="size-[18px] transition-transform duration-200 group-hover/all:translate-x-1.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
