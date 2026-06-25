import { redirect } from "next/navigation";
import { getAskHeroSession } from "@/lib/auth/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getAskHeroSession();
  if (!session) {
    redirect("/signup?next=/dashboard");
  }
  return <>{children}</>;
}
