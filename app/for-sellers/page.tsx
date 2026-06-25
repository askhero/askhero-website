import { createPageMetadata } from "@/lib/seo";
import { Check, BadgeCheck, TrendingUp, Users } from "lucide-react";
import { PageHero, PageShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = createPageMetadata({
  path: "/for-sellers",
  title: "Sell Your Home | AskHero",
  description: "List your home directly for a flat fee or work with a certified Hero Agent. AskHero connects sellers with informed, pre-qualified buyers.",
});

const directItems = [
  "One-time flat listing fee",
  "Hero Score™ generated for your home",
  "Direct buyer inquiries to you",
  "No agent commission required",
  "Listing reviewed & approved within 24 hrs",
];

const agentItems = [
  "Hero Agent creates & manages your listing",
  "Professional photography & staging guidance",
  "Negotiation & offer management",
  "Full support through closing",
  "Access to Hero buyer leads",
];

const whyCards = [
  {
    Icon: BadgeCheck,
    title: "Hero Score™ Reviewed",
    text: "Every buyer on AskHero has reviewed the Hero Score for your home — flood risk, schools, crime signals, and market outlook — before they ever contact you.",
  },
  {
    Icon: TrendingUp,
    title: "Budget Pre-Qualified",
    text: "AskHero buyers enter their income and family size to receive a Hero Safe Budget estimate. They know what they can afford before they reach out.",
  },
  {
    Icon: Users,
    title: "Neighborhood Match",
    text: "Buyers are matched to your listing based on lifestyle priorities — school ratings, commute access, safety signals, and grocery proximity — not just price.",
  },
];

export default function ForSellersPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="For Sellers"
        title="Sell on your terms."
        description="Choose how you want to sell — list directly for a flat fee, or partner with a certified Hero Agent who handles everything."
      />

      {/* Two-path cards */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">

          {/* Left card — Direct Listing (gold border) */}
          <div className="relative flex flex-col rounded-2xl border-2 border-[#c9a84c]/60 bg-white/[0.04] p-8 shadow-[0_0_40px_rgba(201,168,76,0.08)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <h2 className="text-2xl font-bold text-white">Create a Direct Listing</h2>
              <span className="shrink-0 rounded-full border border-[#c9a84c]/50 bg-[#c9a84c]/12 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#c9a84c]">
                Flat Fee
              </span>
            </div>
            <p className="mb-6 text-sm leading-6 text-white/64">
              List your home directly on AskHero for a one-time flat fee. No agent commission. You control your listing, communicate with buyers directly, and keep more of your equity.
            </p>
            <ul className="mb-8 space-y-3">
              {directItems.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-white/80">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#c9a84c]" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-auto">
              <Button className="w-full bg-[#c9a84c] text-[#030712] hover:bg-[#b8963e] font-bold" asChild>
                <Link href="/seller/create-listing">Create My Listing</Link>
              </Button>
            </div>
          </div>

          {/* Right card — Hero Agent */}
          <div className="flex flex-col rounded-2xl border border-white/12 bg-white/[0.04] p-8">
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-white">Work with a Hero Agent</h2>
            </div>
            <p className="mb-6 text-sm leading-6 text-white/64">
              Connect with a certified Hero Agent who creates your listing, handles buyer inquiries, negotiates on your behalf, and guides you through every step to closing.
            </p>
            <ul className="mb-8 space-y-3">
              {agentItems.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-white/80">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#c9a84c]" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-auto">
              <Button variant="secondary" className="w-full font-bold" asChild>
                <Link href="/find-agent">Find a Hero Agent</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why AskHero buyers are different */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-2xl font-bold text-white">Why AskHero buyers are different</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {whyCards.map(({ Icon, title, text }) => (
            <div key={title} className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
              <Icon className="h-6 w-6 text-[#c9a84c]" />
              <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/60">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
