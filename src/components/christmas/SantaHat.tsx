/**
 * The hat on the wordmark.
 *
 * Artwork from Vecteezy, downloaded by the shop. Its Free License requires the
 * author to be credited with "Vecteezy.com" and a link to vecteezy.com, which
 * the footer carries for as long as this hat is on screen - see
 * ChristmasCredit. The white background of the original has been cut away, and
 * only the white connected to the outside edge, so the fur band and the bobble
 * are untouched.
 */
export default function SantaHat({ className = "" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/santa-hat.webp"
      alt=""
      aria-hidden="true"
      width={200}
      height={140}
      loading="lazy"
      decoding="async"
      className={className}
    />
  );
}
