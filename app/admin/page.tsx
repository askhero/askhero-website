import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/app/admin/actions";
import { AdminLoginForm } from "@/app/admin/login-form";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  path: "/admin",
  title: "Admin | AskHero",
  description: "AskHero admin dashboard.",
  noIndex: true,
});
type AdminPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return <AdminLoginForm defaultError={params?.error === "1"} />;
  }

  // Already authenticated — send straight to the dashboard
  redirect("/admin/dashboard");
}
