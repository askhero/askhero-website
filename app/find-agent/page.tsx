import { createPageMetadata } from "@/lib/seo";
import { BadgeCheck, Building2, ShieldCheck, Star } from "lucide-react";
import { PageHero, PageShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = createPageMetadata({
  path: "/find-agent",
  title: "Find a Hero Agent | AskHero",
  description: "Connect with a Hero-certified real estate agent in your market. Agents on AskHero use verified data to help buyers and sellers make confident decisions.",
});

const benefits = [
  {
    Icon: BadgeCheck,
    title: "Hero-Verified Agents",
    text: "Every agent on AskHero is trained to use Hero Score, market data, and buyer intent signals — so you work with someone who knows how to read the numbers.",
  },
  {
    Icon: ShieldCheck,
    title: "Data-Backed Guidance",
    text: "Your agent can pull live flood risk, school ratings, crime signals, and 5-year appreciation projections directly from the Hero platform — not guesswork.",
  },
  {
    Icon: Building2,
    title: "For Buyers and Sellers",
    text: "Whether you're looking to buy a home that matches your life or list with maximum exposure to informed buyers, a Hero agent guides both sides of the transaction.",
  },
  {
    Icon: Star,
    title: "Launch Markets",
    text: "Hero agents are currently active in Charlotte, Raleigh, Atlanta, Nashville, and select Sun Belt markets. More markets launching soon.",
  },
];

export default function FindAgentPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Find an Agent"
        title="Work with an agent who knows the data."
        description="Hero agents use AskHero's verified property intelligence — school ratings, crime signals, flood risk, and market outlook — to help you buy or sell with confidence."
      />

      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-12 sm:px-6 md:grid-cols-2 lg:px-8">
        {benefits.map(({ Icon, title, text }) => (
          <div key={title} className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
            <Icon className="h-6 w-6 text-gold-300" />
            <h2 className="mt-4 text-lg font-semibold">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-white/64">{text}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-gold-400/20 bg-gold-400/8 p-8 md:flex md:items-center md:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold">Ready to connect with a Hero agent?</h2>
            <p className="mt-3 text-white/66">
              Realtors in AskHero launch markets are ready to help buyers and sellers use verified data to make their next move. Let us know your market and we will connect you.
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row md:mt-0 md:ml-8 md:flex-col md:shrink-0">
            <Button asChild>
              <Link href="/for-realtors">I am a Realtor</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/search">Search Listings</Link>
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
