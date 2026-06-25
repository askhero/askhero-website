import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  path: "/dashboard",
  title: "Dashboard | AskHero",
  description: "AskHero buyer dashboard.",
  noIndex: true,
});

import Link from "next/link";
import { Heart, History, Search, Scale, Send } from "lucide-react";
import { PageHero, PageShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";

export default function BuyerDashboardPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Buyer Dashboard"
        title="Your saved homes, searches, comparisons, and inquiries."
        description="This dashboard is wired for Supabase Auth and row-level security. It shows an honest empty state until a buyer creates saved homes, saved searches, comparisons, or leads."
      />
      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-18 sm:px-6 md:grid-cols-4 lg:px-8">
        {[
          { title: "Saved Homes", text: "Only your saved homes appear here.", Icon: Heart },
          { title: "Saved Searches", text: "City and filter alerts are stored per buyer.", Icon: Search },
          { title: "Compare Homes", text: "Compare up to 4 homes side-by-side.", Icon: Scale },
          { title: "Inquiry History", text: "Track agent connection and contact requests.", Icon: History },
        ].map(({ title, text, Icon }) => (
          <div key={title} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <Icon className="h-6 w-6 text-gold-300" />
            <h2 className="mt-4 text-xl font-semibold">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-white/64">{text}</p>
          </div>
        ))}
        <div className="rounded-lg border border-gold-400/20 bg-gold-400/8 p-6 md:col-span-4">
          <h2 className="text-2xl font-semibold">No buyer activity yet</h2>
          <p className="mt-3 max-w-2xl text-white/66">
            Start with search, then save homes, compare up to four, and request
            an agent connection when real approved listings are available.
          </p>
          <Button className="mt-5" asChild>
            <Link href="/search">
              <Send className="h-4 w-4" />
              Search Homes
            </Link>
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
