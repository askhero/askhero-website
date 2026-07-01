import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHero, PageShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { canCreateListing, getAskHeroSession } from "@/lib/auth/session";

export default async function ListingPreviewDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAskHeroSession();
  const { id } = await params;
  if (!session) redirect(`/login?next=/dashboard/listings/${id}/preview`);

  return (
    <PageShell>
      <PageHero
        eyebrow="Listing Preview"
        title={canCreateListing(session.role) ? "Preview your Hero listing." : "Listing creation requires a seller or realtor account."}
        description={canCreateListing(session.role)
          ? "Use the public listing preview after the draft is approved, or return to listings to continue editing."
          : "To create a listing, please join as a seller or realtor."}
      />
      <section className="mx-auto max-w-7xl px-4 pb-18 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <p className="text-white/64">Draft preview route protected.</p>
          <Button asChild className="mt-5">
            <Link href="/dashboard/listings">Back to Listings</Link>
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
