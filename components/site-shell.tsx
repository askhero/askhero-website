import Link from "next/link";
import { Home } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import { getAskHeroSession } from "@/lib/auth/session";

const navItems = [
  ["Search", "/search"],
  ["Hero Score", "/hero-score"],
  ["For Realtors", "/for-realtors"],
  ["For Sellers", "/for-sellers"],
  ["Find an Agent", "/find-agent"],
];

export async function SiteHeader() {
  const session = await getAskHeroSession();

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-navy-900/86 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="AskHero home">
          <span className="flex h-10 w-10 items-center justify-center rounded-md border border-gold-400/45 bg-gold-400/12 text-gold-300">
            <Home className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-normal">AskHero</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-white/68 lg:flex">
          {navItems.map(([label, href]) => (
            <Link key={href} className="transition hover:text-white" href={href}>
              {label}
            </Link>
          ))}
        </nav>
        {session ? (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <LogoutButton />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-white/8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-10 text-sm text-white/58 sm:px-6 md:flex-row md:items-start md:justify-between lg:px-8">
        <div className="max-w-2xl">
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md border border-gold-400/35 bg-gold-400/10 text-gold-300">
              <Home className="h-4 w-4" />
            </span>
            <span>Copyright {new Date().getFullYear()} AskHero. Pre-launch.</span>
          </div>
          <p className="leading-6">
            AskHero helps buyers search homes with Hero AI. Hero Score is informational only and does
            not represent financial, legal, tax, mortgage, insurance, or real
            estate advice.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/contact" className="transition hover:text-white">
            Contact
          </Link>
          <Link href="/privacy" className="transition hover:text-white">
            Privacy
          </Link>
          <Link href="/terms" className="transition hover:text-white">
            Terms
          </Link>
          <Link href="/about" className="transition hover:text-white">
            About
          </Link>
        </div>
      </div>
    </footer>
  );
}

export async function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-askhero-radial text-white">
      <SiteHeader />
      {children}
      <SiteFooter />
    </main>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-300">
        {eyebrow}
      </p>
      <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight tracking-normal sm:text-6xl">
        {title}
      </h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-white/68">
        {description}
      </p>
    </section>
  );
}
