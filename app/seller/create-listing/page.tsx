import { createPageMetadata } from "@/lib/seo";
import { getAskHeroSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { PageHero, PageShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { ListChecks, Camera, Sparkles, ShieldCheck } from "lucide-react";
import Link from "next/link";

export const metadata = createPageMetadata({
  path: "/seller/create-listing",
  title: "Create Your Hero Listing | AskHero",
  description: "List your home on AskHero. Build a Hero listing with verified property data, school ratings, flood risk, and market outlook to attract serious buyers.",
});

const steps = [
  {
    Icon: ListChecks,
    title: "1. Describe your property",
    text: "Tell Hero the address, asking price, beds, baths, and highlights in plain English. No forms to fill out — just describe your home.",
  },
  {
    Icon: Camera,
    title: "2. Upload your photos and video",
    text: "Add your listing photos and walkthrough video. Hero organizes them into a professional media tour automatically.",
  },
  {
    Icon: Sparkles,
    title: "3. Hero enriches the listing",
    text: "Hero pulls verified school ratings, flood risk, grocery access, hospital proximity, crime signals, and a 5-year market outlook for your address.",
  },
  {
    Icon: ShieldCheck,
    title: "4. Publish to informed buyers",
    text: "Your Hero listing is matched with buyers who have already searched by budget, neighborhood signals, and lifestyle priorities — no cold leads.",
  },
];

export default async function SellerCreateListingPage() {
  const session = await getAskHeroSession();

  if (!session) {
    redirect("/signup?next=/seller/create-listing");
  }

  if (session.role === "buyer") {
    redirect("/for-sellers");
  }

  // Sellers and realtors go straight to the Hero Listing Builder
  redirect("/dashboard/listings/new");

  return (
    <PageShell>
      <PageHero
        eyebrow="Seller Listing"
        title="Create your Hero listing."
        description="Build a data-backed listing that reaches informed buyers. Hero verifies your property details, neighborhood data, and market outlook automatically."
      />

      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-12 sm:px-6 md:grid-cols-2 lg:px-8">
        {steps.map(({ Icon, title, text }) => (
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
            <h2 className="text-2xl font-bold">Start your Hero listing</h2>
            <p className="mt-3 text-white/66">
              Sign in with your seller or realtor account to access the Hero Listing Builder and create your first listing.
            </p>
          </div>
          <div className="mt-6 md:mt-0 md:ml-8 md:shrink-0">
            <Button asChild>
              <Link href="/signup?next=/dashboard/listings/new">Get Started</Link>
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
