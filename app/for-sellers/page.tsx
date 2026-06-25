import { createPageMetadata } from "@/lib/seo";
import { BadgeCheck, DollarSign, Home, ListChecks, TrendingUp, Users } from "lucide-react";
import { PageHero, PageShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = createPageMetadata({
  path: "/for-sellers",
  title: "AskHero for Sellers | List Your Home with Hero AI",
  description: "Sellers can list homes on AskHero, reach informed buyers, and get matched with qualified agents in launch markets.",
});

const features = [
  {
    Icon: Users,
    title: "Qualified Buyer Interest",
    text: "Buyers on AskHero have already reviewed Hero Score, budget signals, and neighborhood data before reaching out — so your first contact is a serious one.",
  },
  {
    Icon: ListChecks,
    title: "Hero Listing Builder",
    text: "Work with your agent to create a Hero listing that surfaces the data buyers want most — schools, crime signals, commute access, and long-term market outlook.",
  },
  {
    Icon: DollarSign,
    title: "Transparent Pricing Signals",
    text: "Hero Score helps buyers understand value clearly, reducing back-and-forth negotiations and attracting offers from buyers who already see the upside.",
  },
  {
    Icon: TrendingUp,
    title: "5-Year Market Outlook",
    text: "Every Hero listing includes a built-in market outlook based on local appreciation trends — giving buyers the confidence to move faster.",
  },
  {
    Icon: Home,
    title: "Neighborhood Intelligence",
    text: "Flood risk, nearby schools, grocery access, hospital proximity, and road access are all verified and displayed on your Hero listing automatically.",
  },
  {
    Icon: BadgeCheck,
    title: "Hero-Verified Presentation",
    text: "Listings with verified data signals consistently attract more informed buyers. Hero certification signals quality before a buyer even reaches out.",
  },
];

export default function ForSellersPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="For Sellers"
        title="Reach informed buyers before you list."
        description="AskHero connects sellers with buyers who have already researched budget, neighborhood quality, and long-term value — so when they contact you, they mean it."
      />

      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-12 sm:px-6 md:grid-cols-3 lg:px-8">
        {features.map(({ Icon, title, text }) => (
          <div key={title} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <Icon className="h-6 w-6 text-gold-300" />
            <h2 className="mt-4 text-lg font-semibold">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-white/64">{text}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-gold-400/20 bg-gold-400/8 p-8 md:flex md:items-center md:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold">Ready to list your home?</h2>
            <p className="mt-3 text-white/66">
              AskHero partners with realtors in launch markets. Connect with a Hero agent who can build your listing, surface verified data, and reach buyers who are ready to move.
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row md:mt-0 md:ml-8 md:flex-col md:shrink-0">
            <Button asChild>
              <Link href="/find-agent">Find a Hero Agent</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/login?next=/dashboard/listings/new">Create a Listing</Link>
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
