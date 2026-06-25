import { createPageMetadata } from "@/lib/seo";
import { canCreateListing, getAskHeroSession } from "@/lib/auth/session";
import { HeroListingBuilder } from "@/components/hero/listing-builder/HeroListingBuilder";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = createPageMetadata({
  path: "/dashboard/listings/new",
  title: "Create a Listing in Plain English | AskHero",
  description: "Build an AskHero listing draft from plain English property details, photos, and videos.",
});

export default async function NewListingPage() {
  const session = await getAskHeroSession();
  if (!session) {
    redirect("/signup?next=/dashboard/listings/new");
  }

  if (session.role === "buyer") {
    redirect("/for-sellers");
  }

  return (
    <main className="min-h-screen bg-askhero-radial text-white">
      <section className="mx-auto max-w-[92rem] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <Link href="/" className="mb-8 inline-flex items-center gap-3" aria-label="AskHero home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold-300 bg-gold-400 text-[#030712]">
            <Home className="h-5 w-5" />
          </span>
          <span className="text-lg font-extrabold text-white">AskHero</span>
        </Link>
        {!canCreateListing(session.role) ? (
          <div className="rounded-2xl border border-gold-300/25 bg-gold-400/8 p-6">
            <h1 className="text-2xl font-bold">To create a listing, please join as a seller or realtor.</h1>
            <p className="mt-3 max-w-2xl text-white/66">
              Your current AskHero account is set up for buyer search. Create a seller or realtor account to use Hero Listing Builder.
            </p>
            <Button asChild className="mt-5">
              <Link href="/">Join as a Realtor</Link>
            </Button>
          </div>
        ) : (
          <>
        <div className="mb-10 max-w-4xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-gold-300">Hero Listing Builder</p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-normal text-white sm:text-5xl lg:text-6xl">
            Create a listing in plain English.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/66 sm:text-xl">
            Tell Hero the address, price, property details, and highlights. Hero will turn it into a complete listing draft.
          </p>
        </div>
        <HeroListingBuilder />
          </>
        )}
      </section>
    </main>
  );
}
