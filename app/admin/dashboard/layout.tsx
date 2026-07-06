import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { ReactNode } from "react";

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  if (cookieStore.get("askhero_admin")?.value !== "authenticated") {
    redirect("/admin");
  }
  return <>{children}</>;
}
