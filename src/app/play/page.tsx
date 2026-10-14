import type { Metadata } from "next";
import PageShell from "@/components/ui/PageShell";
import PlayZone from "@/components/play/PlayZone";

export const metadata: Metadata = {
  title: "Play & Win",
  description: "Play free gym brain games from Team Bull Fuel House and win rewards: Plate Memory, Perfect Rep and the Gym Quiz.",
  alternates: { canonical: "/play" },
};

export default function PlayPage() {
  return (
    <PageShell first="Play" second="& Win" narrow={false}>
      <p className="max-w-2xl">Three quick games. Score high and win a reward from Team Bull.</p>
      <div className="pt-4 text-foreground">
        <PlayZone />
      </div>
    </PageShell>
  );
}
