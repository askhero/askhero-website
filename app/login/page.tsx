import { Suspense } from "react";
import { LoginForm } from "@/app/login/login-form";
import { PageHero, PageShell } from "@/components/site-shell";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  path: "/login",
  title: "Sign In | AskHero",
  description: "Sign in or create an AskHero account.",
  noIndex: true,
});

export default function LoginPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Sign In"
        title="Access your AskHero workspace."
        description="Supabase Auth powers buyer and realtor accounts. Additional login options can be enabled later in account settings."
      />
      <section className="mx-auto max-w-md px-4 pb-18 sm:px-6 lg:px-8">
        <Suspense>
          <LoginForm />
        </Suspense>
      </section>
    </PageShell>
  );
}
