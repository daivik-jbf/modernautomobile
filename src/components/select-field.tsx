"use client";

import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "./icons";

export type SelectOption = { value: string; label: string };

type SelectFieldProps = {
  label: string;
  placeholder: string;
  /** shorter text used below the `sm` breakpoint (narrow fields) */
  compactPlaceholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
};

/**
 * Themed, accessible dropdown (ARIA combobox + listbox pattern).
 * Keyboard: ↑ ↓ Home End to move, Enter/Space to pick, Esc to close, type to jump.
 * The panel is always mounted and animated with CSS (see `data-open` styles below). It is rendered in a portal
 * (fixed to the screen, positioned from the field) so no parent's `overflow: hidden` can ever clip the list —
 * the hero section used to cut the Brand / Model lists off on phones.
 */
export function SelectField({
  label,
  placeholder,
  compactPlaceholder,
  value,
  onChange,
  options,
  disabled,
  invalid,
  describedBy,
}: SelectFieldProps) {
  const uid = useId();
  const labelId = `${uid}-label`;
  const listId = `${uid}-list`;
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typeahead = useRef({ text: "", timer: 0 });

  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const [active, setActive] = useState(-1);
  const [pos, setPos] = useState<{ left: number; width: number; top?: number; bottom?: number; maxH: number }>({ left: 0, width: 0, maxH: 256 });
  // true on the client (the portal needs `document`), false while rendering on the server
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  const openList = useCallback(() => {
    if (disabled) return;
    // fixed position from the field; flip upwards when there isn't room below it
    const rect = rootRef.current?.getBoundingClientRect();
    if (rect) {
      const below = window.innerHeight - rect.bottom - 14;
      const above = rect.top - 70; // keep clear of the sticky header
      const up = below < 230 && above > below;
      setOpenUp(up);
      setPos({
        left: rect.left,
        width: rect.width,
        maxH: Math.max(140, Math.min(256, up ? above : below)),
        ...(up ? { bottom: window.innerHeight - rect.top + 6 } : { top: rect.bottom + 6 }),
      });
    }
    setActive(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  }, [disabled, selectedIndex]);

  const close = useCallback(() => setOpen(false), []);

  const choose = useCallback(
    (index: number) => {
      const opt = options[index];
      if (opt) onChange(opt.value);
      setOpen(false);
    },
    [options, onChange],
  );

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!rootRef.current?.contains(t) && !listRef.current?.contains(t)) setOpen(false);
    };
    // the list is fixed to the screen, so close it if the page moves underneath it
    const onMove = () => setOpen(false);
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("scroll", onMove, { passive: true });
    window.addEventListener("resize", onMove);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("scroll", onMove);
      window.removeEventListener("resize", onMove);
    };
  }, [open]);

  // keep the highlighted option in view
  useEffect(() => {
    if (!open || active < 0) return;
    // scroll the list itself (not the page) so the highlighted option stays visible
    const list = listRef.current;
    const el = list?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    if (!list || !el) return;
    if (el.offsetTop < list.scrollTop) list.scrollTop = el.offsetTop - 6;
    else if (el.offsetTop + el.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = el.offsetTop + el.offsetHeight - list.clientHeight + 6;
  }, [open, active]);

  function onKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    const last = options.length - 1;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) openList();
        else setActive((i) => Math.min(i + 1, last));
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!open) openList();
        else setActive((i) => Math.max(i - 1, 0));
        break;
      case "Home":
        if (open) {
          e.preventDefault();
          setActive(0);
        }
        break;
      case "End":
        if (open) {
          e.preventDefault();
          setActive(last);
        }
        break;
      case "Enter":
      case " ":
        if (open) {
          e.preventDefault();
          choose(active);
        }
        // when closed, the native click handler opens it
        break;
      case "Escape":
        if (open) {
          e.preventDefault();
          close();
        }
        break;
      case "Tab":
        close();
        break;
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          const t = typeahead.current;
          window.clearTimeout(t.timer);
          t.text += e.key.toLowerCase();
          t.timer = window.setTimeout(() => (t.text = ""), 600);
          const hit = options.findIndex((o) => o.label.toLowerCase().startsWith(t.text));
          if (hit >= 0) {
            if (!open) openList();
            setActive(hit);
          }
        }
    }
  }

  return (
    <div ref={rootRef} className={`relative ${open ? "z-20" : "z-0"}`}>
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={`${labelId} ${uid}-value`}
        aria-activedescendant={open && active >= 0 ? `${uid}-opt-${active}` : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? describedBy : undefined}
        disabled={disabled}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onKeyDown}
        data-invalid={invalid || undefined}
        className="group/field relative block w-full rounded-lg bg-field px-3.5 pb-1.5 pt-2 text-left sm:px-4 sm:pb-2 sm:pt-2.5 text-field-ink shadow-[0_1px_0_rgba(255,255,255,0.5)_inset] outline-none ring-2 ring-transparent transition-[box-shadow,transform,background-color,opacity] duration-200 hover:bg-white focus-visible:ring-cream enabled:active:scale-[0.995] data-[invalid]:animate-shake data-[invalid]:ring-brand disabled:cursor-not-allowed disabled:opacity-70 aria-expanded:bg-white aria-expanded:ring-brand"
      >
        <span
          id={labelId}
          className="block text-[10px] font-semibold uppercase leading-none tracking-wider sm:text-[11px] text-field-ink/70 transition-colors group-aria-expanded/field:text-brand"
        >
          {label}
        </span>
        <span
          id={`${uid}-value`}
          className={`mt-0.5 block truncate pr-7 text-base leading-tight transition-colors sm:mt-1 sm:pr-8 sm:text-lg ${
            selected ? "font-medium text-field-ink" : "text-field-ink/75"
          }`}
        >
          {selected ? (
            selected.label
          ) : compactPlaceholder ? (
            <>
              <span className="sm:hidden">{compactPlaceholder}</span>
              <span className="hidden sm:inline">{placeholder}</span>
            </>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-5 sm:right-4 -translate-y-1/2 transition-transform duration-300 ease-out group-aria-expanded/field:rotate-180 group-aria-expanded/field:text-brand" />
      </button>

      {mounted &&
        createPortal(
          <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-labelledby={labelId}
          data-open={open}
          data-up={openUp}
          tabIndex={-1}
          style={{ left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom, maxHeight: pos.maxH }}
          className="select-panel fixed z-50 overflow-y-auto overscroll-contain rounded-lg border border-white/10 bg-[#141414] p-1.5 shadow-[0_18px_40px_-8px_rgba(0,0,0,0.65)] ring-1 ring-black/40"
        >
          {options.map((o, i) => {
            const isSelected = i === selectedIndex;
            const isActive = i === active;
            return (
              <li
                key={o.value}
                id={`${uid}-opt-${i}`}
                role="option"
                aria-selected={isSelected}
                data-index={i}
                data-active={isActive || undefined}
                style={{ ["--i" as string]: Math.min(i, 8) }}
                onPointerEnter={() => setActive(i)}
                onPointerDown={(e) => e.preventDefault() /* keep focus on the trigger */}
                onClick={() => choose(i)}
                className="select-option relative flex cursor-pointer items-center justify-between gap-3 rounded-md py-2.5 pl-4 pr-3 text-[17px] text-cream/85 transition-colors duration-150 before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:origin-center before:scale-y-0 before:rounded-full before:bg-brand before:transition-transform before:duration-200 data-[active]:bg-white/[0.07] data-[active]:text-white data-[active]:before:scale-y-100 aria-selected:font-semibold aria-selected:text-white"
              >
                <span className="truncate">{o.label}</span>
                {isSelected && (
                  <svg
                    viewBox="0 0 24 24"
                    className="size-5 shrink-0 text-brand"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>,
          document.body,
        )}
    </div>
  );
}
