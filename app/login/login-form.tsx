"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createSupabaseBrowserClient } from "@/lib/supabase/public";

export function LoginForm({ initialMode = "login" }: { initialMode?: "login" | "register" }) {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [role, setRole] = useState("buyer");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    const fullName = String(form.get("name") || "");

    try {
      const supabase = createSupabaseBrowserClient();
      const result =
        mode === "login"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  full_name: fullName,
                  role,
                },
              },
            });

      if (result.error) {
        setMessage(result.error.message);
        return;
      }

      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role, fullName }),
      });

      window.location.href = searchParams.get("next") || (role === "realtor" || role === "seller" ? "/dashboard/listings/new" : "/dashboard");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Supabase Auth is not configured yet.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4 rounded-lg border border-white/10 bg-navy-850 p-5" onSubmit={onSubmit}>
      <div className="flex gap-2">
        <Button type="button" variant={mode === "login" ? "default" : "secondary"} onClick={() => setMode("login")}>
          Login
        </Button>
        <Button type="button" variant={mode === "register" ? "default" : "secondary"} onClick={() => setMode("register")}>
          Create Account
        </Button>
      </div>
      {mode === "register" ? (
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" autoComplete="name" required />
        </div>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <a href="/forgot-password" className="text-xs text-white/45 hover:text-[#c9a84c] transition-colors">
            Forgot password?
          </a>
        </div>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <div className="space-y-2">
        <Label>Role</Label>
        <Select onValueChange={setRole}>
          <SelectTrigger>
            <SelectValue placeholder="Select your role…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="buyer">Buyer</SelectItem>
            <SelectItem value="realtor">Realtor / Agent</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button className="w-full" disabled={loading}>
        {loading ? "Working..." : mode === "login" ? "Sign In" : "Create Account"}
      </Button>
      {message ? <p className="text-sm text-red-300">{message}</p> : null}
    </form>
  );
}
