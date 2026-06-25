"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/public";

export function LogoutButton({ variant = "ghost" }: { variant?: "ghost" | "secondary" | "outline" }) {
  async function logout() {
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch {
      // The app cookie still gets cleared even if Supabase browser auth is not configured.
    }

    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <Button type="button" variant={variant} size="sm" onClick={logout}>
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  );
}
