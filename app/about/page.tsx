import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  path: "/about",
  title: "About AskHero | AI Real Estate Search",
  description: "AskHero is an AI-powered real estate search and home-buying intelligence platform built to help buyers make smarter home decisions.",
});

import { PageHero, PageShell } from "@/components/site-shell";

export default function AboutPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="About AskHero"
        title="A smarter decision layer for home buyers."
        description="AskHero is an AI-powered real estate search and home-buying intelligence platform in pre-launch. The product is being built to help buyers evaluate homes with more context before making an offer."
      />
      <section className="mx-auto max-w-4xl px-4 pb-18 text-white/68 sm:px-6 lg:px-8">
        <p className="leading-8">
          AskHero is designed for the moment when buyers need more than listing
          photos. The platform will combine approved listing data, buyer-focused
          scoring, neighborhood intelligence, and agent workflows while staying
          careful about compliance and data quality.
        </p>
      </section>
    </PageShell>
  );
}
