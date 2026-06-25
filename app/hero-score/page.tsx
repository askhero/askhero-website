import { createPageMetadata } from "@/lib/seo";
import { BarChart3, ShieldCheck, TrendingUp } from "lucide-react";
import { PageHero, PageShell } from "@/components/site-shell";
import { HeroScoreAccordion } from "@/components/hero/HeroScoreAccordion";

export const metadata = createPageMetadata({
  path: "/hero-score",
  title: "Hero Score | AskHero Home-Buying Intelligence",
  description: "Learn how Hero Score helps buyers understand value, negotiation leverage, neighborhood context, risk, condition, and growth potential.",
});

export default function HeroScorePage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Hero Score"
        title="Explainable home-buying intelligence."
        description="Hero Score is a modular scoring framework designed to help buyers understand value, leverage, neighborhood context, risk, condition, and growth potential before making an offer."
      />

      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-12 sm:px-6 md:grid-cols-3 lg:px-8">
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
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-gold-400/20 bg-gold-400/8 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-white">Score Components</h2>
          <p className="mt-1 text-sm text-white/50">Click any component to see what data it uses and why it matters.</p>
          <div className="mt-6">
            <HeroScoreAccordion />
          </div>
        </div>
      </section>
    </PageShell>
  );
}
