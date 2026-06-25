import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  path: "/realtor/dashboard",
  title: "Realtor Dashboard | AskHero",
  description: "AskHero realtor dashboard.",
  noIndex: true,
});

import Link from "next/link";
import { Download, Home, Sparkles, Upload, Users } from "lucide-react";
import { ListingForm } from "@/app/realtor/dashboard/listing-form";
import { PageHero, PageShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";

export default function RealtorDashboardPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Realtor Dashboard"
        title="Manage launch listings and buyer leads."
        description="Realtor accounts can submit real listings for approval, manage their own listings, view buyer leads, respond to leads, and export CSVs as the platform launches."
      />
      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-10 sm:px-6 md:grid-cols-3 lg:px-8">
        {[
          { title: "Own Listings", text: "Pending, approved, and rejected manual listings.", Icon: Home },
          { title: "Buyer Leads", text: "Lead statuses: New, Contacted, Qualified, Closed, Lost.", Icon: Users },
          { title: "CSV Export", text: "Export leads when data exists.", Icon: Download },
        ].map(({ title, text, Icon }) => (
          <div key={title} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <Icon className="h-6 w-6 text-gold-300" />
            <h2 className="mt-4 text-xl font-semibold">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-white/64">{text}</p>
          </div>
        ))}
      </section>
      <section className="mx-auto max-w-5xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-gold-400/22 bg-gold-400/8 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.28)]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-gold-300" />
                <h2 className="text-2xl font-semibold">Create a listing with Hero</h2>
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/66">
                Type the listing in plain English, upload real photos or videos, review the generated draft, then confirm it for approval.
              </p>
            </div>
            <Button asChild size="lg" className="rounded-2xl">
              <Link href="/dashboard/listings/new">Open Hero Listing Builder</Link>
            </Button>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-4 pb-18 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center gap-2">
          <Upload className="h-5 w-5 text-gold-300" />
          <h2 className="text-2xl font-semibold">Submit Manual Listing</h2>
        </div>
        <ListingForm />
      </section>
    </PageShell>
  );
}
