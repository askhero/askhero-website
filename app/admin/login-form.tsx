"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Home, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminLoginForm({ defaultError }: { defaultError?: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(defaultError ? "Incorrect password." : "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin/dashboard");
    } else {
      setError("Incorrect password.");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b1220] px-4 text-white">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#111827] p-8 shadow-2xl">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#c9a84c]/35 bg-[#c9a84c]/10 text-[#c9a84c]">
            <Home className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-white">AskHero Admin</h1>
            <p className="text-xs text-white/44">Listing approval dashboard</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/44">
              Admin Password
            </label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              autoComplete="current-password"
              required
              className="border-white/15 bg-white/[0.06] text-white placeholder:text-white/30 focus:border-[#c9a84c]/50"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <Button
            className="w-full bg-[#c9a84c] font-bold text-black hover:bg-[#b8973b] disabled:opacity-60"
            disabled={loading || !password}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </div>
    </main>
  );
}
