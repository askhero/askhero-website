import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  path: "/for-realtors",
  title: "AskHero for Realtors | Qualified Buyer Interest",
  description: "Realtors can join AskHero, submit real listings for review, and connect with informed buyers in launch markets.",
});

import { Building2, Sparkles, Upload, Users } from "lucide-react";
import { PageHero, PageShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";

export default function ForRealtorsPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="For Realtors"
        title="Launch with qualified buyer interest."
        description="AskHero helps buyers become more informed before they contact an agent. Realtors can join the launch list, submit listings manually, and manage leads as approved features come online."
      />
      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-18 sm:px-6 md:grid-cols-3 lg:px-8">
        {[
          { title: "Buyer Leads", text: "View and manage buyer interest when launch leads are available.", Icon: Users },
          { title: "Manual Listings", text: "Submit real listings for admin review before public display.", Icon: Upload },
          { title: "Agent Dashboard", text: "Track active listings, leads, and CSV exports.", Icon: Building2 },
        ].map(({ title, text, Icon }) => (
          <div key={title} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <Icon className="h-6 w-6 text-gold-300" />
            <h2 className="mt-4 text-xl font-semibold">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-white/64">{text}</p>
          </div>
        ))}
        <div className="rounded-lg border border-gold-400/20 bg-gold-400/8 p-6 md:col-span-3">
          <h2 className="text-2xl font-semibold">Submit a real listing</h2>
          <p className="mt-3 max-w-2xl text-white/66">
            Use Hero Listing Builder to type a listing in plain English, upload real media, review the generated draft, and submit it for approval. No listing appears publicly until approved.
          </p>
          <Button className="mt-5" asChild>
            <a href="/dashboard/listings/new"><Sparkles className="h-4 w-4" /> Create a Listing with Hero</a>
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
