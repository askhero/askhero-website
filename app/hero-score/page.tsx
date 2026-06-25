import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  path: "/hero-score",
  title: "Hero Score | AskHero Home-Buying Intelligence",
  description: "Learn how Hero Score helps buyers understand value, negotiation leverage, neighborhood context, risk, condition, and growth potential.",
});

import { BarChart3, ShieldCheck, TrendingUp } from "lucide-react";
import { PageHero, PageShell } from "@/components/site-shell";

const components = [
  "Market Value Score",
  "Negotiation Power Score",
  "Neighborhood Quality Score",
  "Insurance Risk Score",
  "Property Condition Score",
  "Growth Potential Score",
];

export default function HeroScorePage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Hero Score"
        title="Explainable home-buying intelligence."
        description="Hero Score is a modular scoring framework designed to help buyers understand value, leverage, neighborhood context, risk, condition, and growth potential before making an offer."
      />
      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-18 sm:px-6 md:grid-cols-3 lg:px-8">
        {[
          { title: "Transparent", text: "Each score stores component-level reasoning.", Icon: BarChart3 },
          { title: "Informational", text: "Scores are not financial, legal, insurance, or real estate advice.", Icon: ShieldCheck },
          { title: "Recalculated", text: "Scores are recalculated when listing data changes.", Icon: TrendingUp },
        ].map(({ title, text, Icon }) => (
          <div key={title} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <Icon className="h-6 w-6 text-gold-300" />
            <h2 className="mt-4 text-xl font-semibold">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-white/64">{text}</p>
          </div>
        ))}
        <div className="rounded-lg border border-gold-400/20 bg-gold-400/8 p-6 md:col-span-3">
          <h2 className="text-2xl font-semibold">Components</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {components.map((component) => (
              <div key={component} className="rounded-md border border-white/10 bg-navy-850 p-4">
                {component}
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
