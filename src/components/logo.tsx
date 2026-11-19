/**
 * Brand lockup: "MA" mark + divider + wordmark.
 * NOTE: the mark is redrawn from the design screenshot (traced at 12x zoom).
 * Swap the <svg> for the official logo file when available.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-4 ${className}`}>
      <svg
        viewBox="60 35 880 312"
        className="h-[20px] w-auto text-brand-logo sm:h-[24px]"
        fill="currentColor"
        aria-hidden="true"
      >
        {/* M — two slanted legs with a bridged centre */}
        <path d="M60 345 H185 L385 38 H265 Z" />
        <path d="M290 345 H390 L595 38 H495 Z" />
        <path d="M292 185 L385 38 L398 100 L495 38 L397 185 Z" />
        <path d="M497 185 L595 38 L645 110 L695 38 L597 185 Z" />
        {/* A — left leg, right leg, crossbar */}
        <path d="M490 345 H600 L805 38 H695 Z" />
        <path d="M805 38 L935 345 H820 L735 135 Z" />
        <path d="M683 236 H766 L792 285 H650 Z" />
      </svg>
      <span className="h-6 w-px bg-white/35" aria-hidden="true" />
      <span className="font-condensed text-[15px] font-semibold uppercase tracking-[0.06em] text-white sm:text-lg">
        Modern Automobiles
      </span>
    </span>
  );
}
