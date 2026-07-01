import { redirect } from "next/navigation";
import { getAskHeroSession } from "@/lib/auth/session";

// Middleware handles the redirect for missing cookies; this layer catches
// requests that pass middleware but fail HMAC verification (tampered cookies).
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getAskHeroSession();
  if (!session) redirect("/login");
  return <>{children}</>;
}
