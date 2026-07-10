import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { PageHero, PageShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { canCreateListing, getAskHeroSession } from "@/lib/auth/session";
import { createPageMetadata } from "@/lib/seo";
import { SubmitBanner } from "@/app/dashboard/listings/SubmitBanner";

export const metadata = createPageMetadata({
  path: "/dashboard/listings",
  title: "Your Listings | AskHero",
  description: "Manage AskHero listing drafts.",
  noIndex: true,
});

type Props = { searchParams?: Promise<{ message?: string }> };

export default async function ListingsDashboardPage({ searchParams }: Props) {
  const session = await getAskHeroSession();
  if (!session) redirect("/login?next=/dashboard/listings");

  const params = await searchParams;
  const showSuccess = params?.message === "listing-submitted";

  return (
    <PageShell>
      <PageHero
        eyebrow="Hero Listings"
        title={
          canCreateListing(session.role)
            ? "Create and manage listing drafts."
            : "Listing creation requires a seller or realtor account."
        }
        description={
          canCreateListing(session.role)
            ? "Build listings in plain English, review enrichment, and submit finished drafts for approval."
            : "To create a listing, please join as a seller or realtor."
        }
      />
      <section className="mx-auto max-w-7xl px-4 pb-18 sm:px-6 lg:px-8">
        {showSuccess && <SubmitBanner />}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <FileText className="h-7 w-7 text-gold-300" />
          <h2 className="mt-4 text-2xl font-bold text-white">No listing dashboard activity yet</h2>
          <p className="mt-3 max-w-2xl text-white/64">
            Listing drafts will appear here after they are created with Hero Listing Builder.
          </p>
          {canCreateListing(session.role) ? (
            <Button asChild className="mt-5">
              <Link href="/dashboard/listings/new">
                <Plus className="h-4 w-4" />
                Create Free Listing
              </Link>
            </Button>
          ) : null}
        </div>
      </section>
    </PageShell>
  );
}
