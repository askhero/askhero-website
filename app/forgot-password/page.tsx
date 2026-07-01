"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/public";

export default function ForgotPasswordPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const email = String(new FormData(event.currentTarget).get("email") || "");

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "https://www.askhero.net/reset-password",
      });

      if (error) {
        setErrorMessage(error.message);
        setStatus("error");
        return;
      }

      setStatus("sent");
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-askhero-radial text-white">
      <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-14 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-300">
          Account
        </p>
        <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
          Reset your password.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-white/68">
          Enter your email and we&apos;ll send you a link to set a new password.
        </p>
      </div>

      <section className="mx-auto w-full max-w-md px-4 pb-18 sm:px-6 lg:px-8">
        {status === "sent" ? (
          <div className="rounded-lg border border-green-400/25 bg-green-400/8 p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-green-400/30 bg-green-400/10 text-green-300">
                <Mail className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-white">Check your email</p>
                <p className="mt-0.5 text-sm text-white/64">
                  We&apos;ve sent a password reset link to your inbox.
                </p>
              </div>
            </div>
            <Link
              href="/login"
              className="mt-5 flex items-center gap-1.5 text-sm text-white/50 transition hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to sign in
            </Link>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="space-y-4 rounded-lg border border-white/10 bg-navy-850 p-5"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
              />
            </div>

            {status === "error" ? (
              <p className="text-sm text-red-300">{errorMessage}</p>
            ) : null}

            <Button className="w-full" disabled={status === "loading"}>
              {status === "loading" ? "Sending…" : "Send reset link"}
            </Button>

            <Link
              href="/login"
              className="flex items-center gap-1.5 text-sm text-white/50 transition hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to sign in
            </Link>
          </form>
        )}
      </section>
    </main>
  );
}
