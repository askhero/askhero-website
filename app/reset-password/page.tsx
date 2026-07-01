"use client";

import { FormEvent, useEffect, useState } from "react";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/public";

type PageState = "waiting" | "ready" | "loading" | "error" | "success";

export default function ResetPasswordPage() {
  const [pageState, setPageState] = useState<PageState>("waiting");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setPageState("ready");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPageState("loading");
    setErrorMessage("");

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    const confirm = String(form.get("confirm") || "");

    if (password !== confirm) {
      setErrorMessage("Passwords do not match.");
      setPageState("ready");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      setPageState("ready");
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setErrorMessage(error.message);
        setPageState("error");
        return;
      }

      window.location.href = "/dashboard?message=password-updated";
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setPageState("error");
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-askhero-radial text-white">
      <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-14 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-300">
          Account
        </p>
        <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
          Set a new password.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-white/68">
          Choose a strong password for your AskHero account.
        </p>
      </div>

      <section className="mx-auto w-full max-w-md px-4 pb-18 sm:px-6 lg:px-8">
        {pageState === "waiting" ? (
          <div className="rounded-lg border border-white/10 bg-navy-850 p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold-400/30 bg-gold-400/10 text-gold-300">
                <KeyRound className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-white">Verifying reset link…</p>
                <p className="mt-0.5 text-sm text-white/60">
                  If you arrived via your email link, the form will appear shortly.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="space-y-4 rounded-lg border border-white/10 bg-navy-850 p-5"
          >
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                required
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm new password</Label>
              <Input
                id="confirm"
                name="confirm"
                type="password"
                autoComplete="new-password"
                placeholder="Repeat your new password"
                required
              />
            </div>

            {errorMessage ? (
              <p className="text-sm text-red-300">{errorMessage}</p>
            ) : null}

            <Button
              className="w-full"
              disabled={pageState === "loading"}
            >
              {pageState === "loading" ? "Updating…" : "Update password"}
            </Button>
          </form>
        )}
      </section>
    </main>
  );
}
