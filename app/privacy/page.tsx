import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  path: "/privacy",
  title: "Privacy | AskHero",
  description: "Read how AskHero handles submitted signup, contact, realtor, and product information.",
});

import { PageHero, PageShell } from "@/components/site-shell";

export default function PrivacyPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Privacy"
        title="Simple pre-launch privacy language."
        description="AskHero collects information you submit so we can operate the product, respond to you, and understand launch demand."
      />
      <section className="mx-auto max-w-4xl px-4 pb-18 leading-8 text-white/68 sm:px-6 lg:px-8">
        <p>
          We do not sell submitted waitlist, contact, realtor, or lead
          information. You can request removal by contacting hello@askhero.net.
          As the platform grows, this policy should be reviewed by counsel and
          expanded before public launch.
        </p>
      </section>
    </PageShell>
  );
}
