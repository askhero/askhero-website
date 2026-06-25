import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  path: "/contact",
  title: "Contact AskHero | Support and Partnerships",
  description: "Contact AskHero for support, realtor interest, listing data, partnerships, or product questions.",
});

import { ContactForm } from "@/app/contact/contact-form";
import { PageHero, PageShell } from "@/components/site-shell";

export default function ContactPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Contact"
        title="Talk to AskHero."
        description="Send a note about early access, realtor launch interest, listing data, or partnerships."
      />
      <section className="mx-auto max-w-2xl px-4 pb-18 sm:px-6 lg:px-8">
        <ContactForm />
      </section>
    </PageShell>
  );
}
