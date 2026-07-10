import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ListingsTable } from "./ListingsTable";

export const dynamic = "force-dynamic";

export type AdminListing = {
  id: string;
  address_line_1: string | null;
  city: string | null;
  state: string | null;
  price: number | null;
  status: string | null;
  approval_status: string | null;
  created_at: string | null;
};

async function fetchListings(): Promise<AdminListing[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("listings")
    .select("id,address_line_1,city,state,price,status,approval_status,created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    console.error(error);
    return [];
  }
  return (data ?? []) as AdminListing[];
}

export default async function AdminDashboardPage() {
  const listings = await fetchListings();

  const total = listings.length;
  const pending = listings.filter((l) => l.approval_status === "pending").length;
  const approved = listings.filter((l) => l.approval_status === "approved").length;
  const draft = listings.filter((l) => l.status === "draft").length;

  return (
    <main className="min-h-screen bg-[#0b1220] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Listings Dashboard</h1>
            <p className="mt-1 text-sm text-white/44">Approve or reject listings for the AskHero marketplace.</p>
          </div>
          <form action="/api/admin/signout" method="POST">
            <button
              type="submit"
              className="rounded-lg border border-white/15 bg-white/[0.05] px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10"
            >
              Sign out
            </button>
          </form>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total" value={total} />
          <StatCard label="Pending" value={pending} color="#c9a84c" />
          <StatCard label="Approved" value={approved} color="#4ade80" />
          <StatCard label="Draft" value={draft} color="#94a3b8" />
        </div>

        <ListingsTable listings={listings} />
      </div>
    </main>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-white/38">{label}</p>
      <p className="mt-2 text-4xl font-extrabold" style={{ color: color ?? "white" }}>{value}</p>
    </div>
  );
}
