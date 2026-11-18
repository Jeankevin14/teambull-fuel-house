import NewBadge from "@/components/ui/NewBadge";
import Link from "next/link";
import CartLink from "./CartLink";
import AuthLink from "./AuthLink";
import ChristmasOnly from "@/components/christmas/ChristmasOnly";
import Garland from "@/components/christmas/Garland";
import SantaHat from "@/components/christmas/SantaHat";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="relative font-display text-xl font-bold uppercase tracking-wide sm:text-2xl"
        >
          <ChristmasOnly>
            <SantaHat className="absolute -left-4 -top-4 w-10 -rotate-[14deg] sm:-top-5 sm:w-12" />
          </ChristmasOnly>
          Teambull <span className="text-accent">Fuel House</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm font-medium sm:gap-6">
          <Link href="/products" className="hidden hover:text-accent md:inline">
            Products
          </Link>
          <Link href="/play" className="hidden items-center gap-1.5 hover:text-accent md:inline-flex">
            Play <NewBadge />
          </Link>
          <Link
            href="/find-supplement"
            className="hidden whitespace-nowrap hover:text-accent xl:inline"
          >
            Find Supplement
          </Link>
          <Link href="/about" className="hidden hover:text-accent md:inline">
            About
          </Link>
          <Link href="/contact" className="hidden whitespace-nowrap hover:text-accent xl:inline">
            Contact
          </Link>
          <AuthLink />
          <CartLink />
        </nav>
      </div>

      {/* phones: quick links in a second row, About right beside Products */}
      <nav
        aria-label="Quick links"
        className="flex items-center justify-center gap-1 overflow-hidden border-t border-line bg-surface px-0.5 text-[12px] font-semibold min-[340px]:px-1 min-[340px]:text-[13px] min-[380px]:px-2 min-[380px]:text-sm md:hidden"
      >
        {[
          ["Products", "/products", false],
          ["About", "/about", false],
          ["Play", "/play", true],
        ].map(([label, href, isNew]) => (
          <Link
            key={String(href)}
            href={String(href)}
            className="inline-flex items-center gap-1 px-2 py-2.5 min-[380px]:px-2.5 hover:text-accent active:text-accent"
          >
            {label}
            {isNew && <NewBadge />}
          </Link>
        ))}
      </nav>
      <ChristmasOnly>
        <Garland />
      </ChristmasOnly>

    </header>
  );
}
