import { Suspense } from "react";
import Link from "next/link";
import { Home, Check } from "lucide-react";
import { LoginForm } from "@/app/login/login-form";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  path: "/signup",
  title: "Sign Up | AskHero",
  description: "Create an AskHero account.",
  noIndex: true,
});

const bullets = [
  "Hero Score™ ranks every listing against your real priorities",
  "Budget, schools, safety, commute — all analyzed before you offer",
  "Connect with Hero Agents who know the data",
];

export default function SignupPage() {
  return (
    <div className="flex min-h-screen text-white">
      {/* Left column — marketing panel (desktop only) */}
      <div className="hidden w-1/2 flex-col justify-between bg-[#0a0a0a] px-12 py-12 lg:flex xl:px-16">
        <Link href="/" className="flex items-center gap-3" aria-label="AskHero home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#c9a84c]/45 bg-[#c9a84c]/12 text-[#c9a84c]">
            <Home className="h-5 w-5" />
          </span>
          <span className="text-lg font-extrabold text-white">AskHero</span>
        </Link>

        <div className="max-w-sm">
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-white xl:text-5xl">
            The smarter way to find your next home.
          </h2>
          <ul className="mt-8 space-y-4">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-3 text-base text-white/75">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#c9a84c]" />
                {b}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-white/30">
          &copy; {new Date().getFullYear()} AskHero. All rights reserved.
        </p>
      </div>

      {/* Right column — form */}
      <div className="flex w-full flex-col items-center justify-center bg-askhero-radial px-6 py-12 lg:w-1/2 lg:px-12 xl:px-16">
        {/* Mobile logo */}
        <div className="mb-8 lg:hidden">
          <Link href="/" className="flex items-center gap-3" aria-label="AskHero home">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#c9a84c]/45 bg-[#c9a84c]/12 text-[#c9a84c]">
              <Home className="h-5 w-5" />
            </span>
            <span className="text-lg font-extrabold text-white">AskHero</span>
          </Link>
        </div>

        <div className="w-full max-w-md">
          <p className="text-sm font-semibold text-[#c9a84c]">Join free. No credit card required.</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Create your AskHero account</h1>
          <div className="mt-6">
            <Suspense>
              <LoginForm initialMode="register" />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
