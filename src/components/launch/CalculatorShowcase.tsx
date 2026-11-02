import FeatureList from "./FeatureList";

/**
 * Scene 6 — the two calculators, described from what src/lib/bmi.ts actually
 * does: WHO or Asian cut-offs for BMI, and a protein range per kilogram that
 * shifts with goal, activity and age.
 */
export default function CalculatorShowcase({ which }: { which: "bmi" | "protein" }) {
  if (which === "bmi") {
    return (
      <FeatureList
        eyebrow="Free tool"
        head="BMI"
        accent="calculator"
        sub="Your height and weight, read against WHO or Asian cut-offs."
        items={[
          { title: "Where you stand", detail: "Underweight, normal, overweight or obese" },
          { title: "Your healthy range", detail: "The weight range for your height, in kilograms" },
          { title: "Calories and protein", detail: "What to eat each day for your goal" },
        ]}
        note="A screening number, not a diagnosis."
      />
    );
  }
  return (
    <FeatureList
      eyebrow="Free tool"
      head="Protein"
      accent="calculator"
      sub="Weight, goal, activity and age give you a daily protein range."
      items={[
        { title: "Your goal", detail: "Lose fat, maintain, or build muscle" },
        { title: "How hard you train", detail: "From sedentary to athlete" },
        { title: "Grams per day", detail: "A range to aim for, not a single number" },
      ]}
    />
  );
}
