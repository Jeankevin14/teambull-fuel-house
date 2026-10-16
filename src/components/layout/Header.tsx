import NewBadge from "@/components/ui/NewBadge";
import Link from "next/link";
import CartLink from "./CartLink";
import AuthLink from "./AuthLink";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="font-display text-xl font-bold uppercase tracking-wide sm:text-2xl"
        >
          Teambull <span className="text-accent">Fuel House</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm font-medium sm:gap-6">
          <Link href="/products" className="hidden hover:text-accent sm:inline">
            Products
          </Link>
          <Link href="/bundles" className="hidden items-center gap-1.5 hover:text-accent sm:inline-flex">
            Combos <NewBadge />
          </Link>
          <Link
            href="/find-supplement"
            className="hidden hover:text-accent lg:inline"
          >
            Find Supplement
          </Link>
          <Link href="/about" className="hidden hover:text-accent sm:inline">
            About
          </Link>
          <Link href="/contact" className="hidden hover:text-accent sm:inline">
            Contact
          </Link>
          <AuthLink />
          <CartLink />
        </nav>
      </div>

      {/* phones: quick links in a second row, About right beside Products */}
      <nav
        aria-label="Quick links"
        className="flex items-center justify-center gap-1 border-t border-line bg-surface px-2 text-sm font-semibold sm:hidden"
      >
        {[
          ["Products", "/products"],
          ["About", "/about"],
          ["Combos", "/bundles"],
          ["Contact", "/contact"],
        ].map(([label, href]) => (
          <Link key={href} href={href} className="px-3 py-2.5 active:text-accent hover:text-accent">
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
