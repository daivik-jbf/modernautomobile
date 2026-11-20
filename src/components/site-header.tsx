import Link from "next/link";
import { ArrowRight } from "./icons";
import { Logo } from "./logo";
import { NavImagePreload } from "./nav-image-preload";
import { MobileNav } from "./mobile-nav";
import { NavLinks } from "./nav-links";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-ink">
      <div className="flex h-14 items-center justify-between px-5 sm:h-[60px] lg:px-[4%]">
        <Link href="/" aria-label="Modern Automobiles — home">
          <Logo />
        </Link>

        <nav aria-label="Primary" className="hidden h-full lg:block">
          <NavLinks />
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/track"
            className="hidden items-center gap-2 rounded-full border border-white/80 px-5 py-1.5 text-[15px] font-medium text-white transition-colors hover:bg-white hover:text-ink sm:inline-flex"
          >
            Track booking
            <ArrowRight className="size-4" />
          </Link>
          <MobileNav />
          <NavImagePreload />
        </div>
      </div>
    </header>
  );
}
