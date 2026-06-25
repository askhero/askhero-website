import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  path: "/terms",
  title: "Terms | AskHero",
  description: "Read AskHero terms, product disclaimers, and informational-use guidance.",
});

import { PageHero, PageShell } from "@/components/site-shell";

export default function TermsPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Terms"
        title="Pre-launch disclaimer."
        description="AskHero is a pre-launch product. Features, markets, scoring, and availability may change before launch."
      />
      <section className="mx-auto max-w-4xl px-4 pb-18 leading-8 text-white/68 sm:px-6 lg:px-8">
        <p>
          Hero Score is informational only and does not represent financial,
          legal, tax, mortgage, insurance, or real estate advice. AskHero does
          not claim MLS access and will not display live listings unless real
          listings are approved in the database through compliant sources.
        </p>
      </section>
    </PageShell>
  );
}
