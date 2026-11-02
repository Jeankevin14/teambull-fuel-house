import FeatureList from "./FeatureList";

/**
 * Scene 5 — Play & Win, exactly as src/components/play implements it:
 * three games, badges and a certificate. Rewards are switched off in
 * src/config/rewards.ts, so nothing here promises a prize.
 */
export default function PlayWinShowcase() {
  return (
    <FeatureList
      eyebrow="Play & win"
      head="Gym brain"
      accent="games"
      sub="Three quick games on the site. Score well and you earn a badge and a certificate."
      items={[
        { title: "Plate Memory", detail: "Match six pairs in the fewest moves" },
        { title: "Perfect Rep", detail: "Stop the bar in the green zone" },
        { title: "Gym Quiz", detail: "Five questions on training and food" },
      ]}
      note="Gold, Silver and Bronze badges, and a certificate. No prizes are promised."
    />
  );
}
