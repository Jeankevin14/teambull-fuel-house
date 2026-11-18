/**
 * The credit the Vecteezy Free License asks for: the author named, and a link
 * to vecteezy.com. It appears only while the decorations are up, because that
 * is the only time their artwork is on the page.
 */
export default function ChristmasCredit() {
  return (
    <p className="mt-4 text-xs text-muted">
      Christmas hat artwork from{" "}
      <a
        href="https://www.vecteezy.com"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-accent hover:underline"
      >
        Vecteezy.com
      </a>
    </p>
  );
}
