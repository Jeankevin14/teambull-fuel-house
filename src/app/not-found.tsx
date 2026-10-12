import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="font-display text-5xl font-bold uppercase">
        Page <span className="text-accent">not found</span>
      </h1>
      <p className="mt-4 text-muted">
        Sorry, we could not find the page you were looking for.
      </p>
      <Link
        href="/products"
        className="mt-8 inline-block rounded-full bg-accent px-8 py-4 font-semibold text-white hover:opacity-90"
      >
        Browse Products
      </Link>
    </div>
  );
}
