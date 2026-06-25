import { Suspense } from "react";
import Link from "next/link";
import { Home } from "lucide-react";
import { LoginForm } from "@/app/login/login-form";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  path: "/signup",
  title: "Sign Up | AskHero",
  description: "Create an AskHero account.",
  noIndex: true,
});

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-askhero-radial px-4 py-12 text-white">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 inline-flex items-center gap-3" aria-label="AskHero home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold-300 bg-gold-400 text-[#030712]">
            <Home className="h-5 w-5" />
          </span>
          <span className="text-xl font-extrabold text-white">AskHero</span>
        </Link>
        <h1 className="mb-4 text-3xl font-bold">Create your AskHero account</h1>
        <Suspense>
          <LoginForm initialMode="register" />
        </Suspense>
      </div>
    </main>
  );
}
