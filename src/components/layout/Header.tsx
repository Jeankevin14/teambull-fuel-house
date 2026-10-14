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
          <Link href="/products" className="hover:text-accent">
            Products
          </Link>
          <Link href="/bundles" className="hidden hover:text-accent sm:inline">
            Combos
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
    </header>
  );
}
