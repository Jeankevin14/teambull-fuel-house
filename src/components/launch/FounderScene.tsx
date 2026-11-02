import type { Person } from "@/config/people";

/**
 * Scene 3 — the founder, the co-founder, then the two of them.
 * Names, roles and photographs come from src/config/people.ts, the same file the
 * About page reads, so the film can never say something the site does not.
 */
export default function FounderScene({
  person,
  pair,
}: {
  person?: Person;
  pair?: Person[];
}) {
  if (pair) {
    return (
      <div className="tb-scene">
        <div className="tb-pair">
          {pair.map((p) => (
            <figure key={p.name} className="tb-portrait">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.photo} alt={`${p.name}, ${p.role.toLowerCase()}`} loading="eager" />
            </figure>
          ))}
        </div>
        <h2 className="tb-head" style={{ animationDelay: "0.8s", fontSize: "clamp(1.3rem,4.4vw,2.6rem)" }}>
          Built with passion. <em>Driven by purpose.</em>
        </h2>
      </div>
    );
  }
  if (!person) return null;
  return (
    <div className="tb-scene">
      <figure className="tb-portrait tb-portrait-one">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={person.photo} alt={`${person.name}, ${person.role.toLowerCase()}`} loading="eager" />
      </figure>
      <p className="tb-role" style={{ marginTop: 6 }}>{person.role}</p>
      <h2 className="tb-head" style={{ fontSize: "clamp(1.6rem,5.2vw,3rem)" }}>{person.name}</h2>
      <p className="tb-sub">{person.blurb}</p>
    </div>
  );
}
