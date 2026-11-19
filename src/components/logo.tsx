/**
 * Brand lockup: "MA" mark + divider + wordmark.
 * The mark is the official artwork (assets/Modern-Automobiles-Footer-Assets/ma-mark.svg).
 */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 107 36" className={`w-auto text-brand-logo ${className}`} fill="currentColor" aria-hidden="true">
      <path d="M0 35 24 1h14l-1 14L49 1h15l-1 15L76 1h14l17 34H93L82 12 66 35H51l2-16-15 16H24l2-16-12 16z" />
      <path d="m74 29 6-9 5 9z" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-4 ${className}`}>
      <LogoMark className="h-[20px] sm:h-[24px]" />
      <span className="h-6 w-px bg-white/35" aria-hidden="true" />
      <span className="font-condensed text-[15px] font-semibold uppercase tracking-[0.06em] text-white sm:text-lg">
        Modern Automobiles
      </span>
    </span>
  );
}
