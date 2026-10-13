import type { Metadata } from "next";
import AboutExplorer from "@/components/about/AboutExplorer";

export const metadata: Metadata = {
  title: "About",
  description:
    "Team Bull is a performance-driven bodybuilding and fitness coaching brand, founded by Vishwam D. Genuine gym supplements from Teambull Fuel House in Puducherry.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return <AboutExplorer />;
}
