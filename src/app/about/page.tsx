import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import AboutExplorer from "@/components/about/AboutExplorer";

export const metadata: Metadata = pageMeta({
  title: "About",
  description:
    "Team Bull is a performance-driven bodybuilding and fitness coaching brand, founded by Vishwam D. Genuine gym supplements from Teambull Fuel House in Puducherry.",
  path: "/about",
});

export default function AboutPage() {
  return <AboutExplorer />;
}
