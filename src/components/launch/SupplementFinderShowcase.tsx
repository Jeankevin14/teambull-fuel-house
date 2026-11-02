import FeatureList from "./FeatureList";

/**
 * Scene 7 — Find My Supplement. The real tool asks two questions, goal then
 * budget, and ranks the matching categories. Nothing here invents a result.
 */
export default function SupplementFinderShowcase() {
  return (
    <FeatureList
      eyebrow="Not sure what to buy?"
      head="Find your"
      accent="supplement"
      sub="Two questions and you have an answer."
      items={[
        { title: "Your goal", detail: "What you are training for" },
        { title: "Your budget", detail: "What you want to spend" },
        { title: "Your picks", detail: "The categories that fit, in order" },
      ]}
    />
  );
}
