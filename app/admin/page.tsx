import { Download, Home, LogOut } from "lucide-react";
import { loginAdmin, logoutAdmin, isAdminAuthenticated } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
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

type TableValue = string | number | boolean | Record<string, unknown> | unknown[] | null;
type TableRow = Record<string, TableValue>;

const tableConfigs = [
  {
    key: "users_profile",
    title: "Users",
    columns: ["created_at", "email", "full_name", "phone", "role"],
    orderBy: "created_at",
  },
  {
    key: "waitlist_signups",
    title: "Waitlist Signups",
    columns: ["created_at", "first_name", "last_name", "email", "city", "role"],
    orderBy: "created_at",
  },
  {
    key: "realtor_profiles",
    title: "Realtor Profiles",
    columns: ["created_at", "name", "email", "phone", "brokerage", "market", "approval_status"],
    orderBy: "created_at",
  },
  {
    key: "listings",
    title: "Listings",
    columns: ["created_at", "address_line_1", "city", "state", "zip", "price", "status", "approval_status", "source_type"],
    orderBy: "created_at",
  },
  {
    key: "listing_enrichment",
    title: "Listing Enrichment",
    columns: ["updated_at", "listing_id", "flood_data", "crime_data", "unavailable_data"],
    orderBy: "updated_at",
  },
  {
    key: "leads",
    title: "Leads",
    columns: ["created_at", "first_name", "last_name", "email", "phone", "status", "message"],
    orderBy: "created_at",
  },
  {
    key: "contact_messages",
    title: "Contact Messages",
    columns: ["created_at", "name", "email", "phone", "subject", "message", "status"],
    orderBy: "created_at",
  },
  {
    key: "realtor_signups",
    title: "Realtor Signups",
    columns: ["created_at", "name", "email", "phone", "brokerage", "market"],
    orderBy: "created_at",
  },
];

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return <LoginView error={params?.error === "1"} />;
  }

  let data: Record<string, TableRow[]> = {};
  let dataError = "";

  try {
    const supabase = createSupabaseAdminClient();
    const results = await Promise.all(
      tableConfigs.map(async (table) => {
        const { data: rows, error } = await supabase
          .from(table.key)
          .select("*")
          .order(table.orderBy, { ascending: false })
          .limit(250);

 if (error) {
  throw error;
}

        return [table.key, rows || []] as const;
      }),
    );

    data = Object.fromEntries(results);
  } catch (error) {
    console.error(error);
    dataError =
      "Unable to load admin data. Check Supabase environment variables and table setup.";
  }

  return (
    <main className="min-h-screen bg-askhero-radial px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md border border-gold-400/35 bg-gold-400/10 text-gold-300">
              <Home className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-3xl font-semibold tracking-normal">
                AskHero Admin
              </h1>
              <p className="mt-1 text-sm text-white/58">
                Showing the latest 250 rows from each table.
              </p>
            </div>
          </div>
          <form action={logoutAdmin}>
            <Button variant="secondary">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </form>
        </div>

        {dataError ? (
          <div className="mt-6 rounded-lg border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100">
            {dataError}
          </div>
        ) : null}

        <div className="mt-8 space-y-8">
          {tableConfigs.map((table) => (
            <section
              key={table.key}
              className="rounded-lg border border-white/10 bg-white/[0.04] p-4 sm:p-5"
            >
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{table.title}</h2>
                  <p className="mt-1 text-sm text-white/54">
                    {(data[table.key] || []).length} records loaded
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <a href={`/api/admin/export?table=${table.key}`}>
                    <Download className="h-4 w-4" />
                    Export CSV
                  </a>
                </Button>
              </div>
              <DataTable rows={data[table.key] || []} columns={table.columns} />
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

function LoginView({ error }: { error: boolean }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-askhero-radial px-4 text-white">
      <div className="w-full max-w-md rounded-lg border border-white/10 bg-navy-850 p-6 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md border border-gold-400/35 bg-gold-400/10 text-gold-300">
            <Home className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-normal">
              AskHero Admin
            </h1>
            <p className="mt-1 text-sm text-white/58">Sign in to view launch data.</p>
          </div>
        </div>
        <form action={loginAdmin} className="space-y-4">
          <Input
            name="password"
            type="password"
            placeholder="Admin password"
            autoComplete="current-password"
            required
          />
          <Button className="w-full">Sign In</Button>
          {error ? (
            <p className="text-sm text-red-300" role="alert">
              Incorrect admin password.
            </p>
          ) : null}
        </form>
      </div>
    </main>
  );
}

function DataTable({
  rows,
  columns,
}: {
  rows: TableRow[];
  columns: string[];
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-md border border-white/8 bg-navy-900/40 p-6 text-sm text-white/56">
        No records yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-white/8">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead className="bg-white/[0.06] text-white/68">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-4 py-3 font-medium">
                {column.replaceAll("_", " ")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={String(row.id)} className="border-t border-white/8">
              {columns.map((column) => (
                <td key={column} className="max-w-md px-4 py-3 text-white/72">
                  {formatValue(row[column])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatValue(value: TableValue) {
  if (value === null || value === undefined || value === "") {
    return "--";
  }

  if (Array.isArray(value) || typeof value === "object") {
    return JSON.stringify(value);
  }

  if (typeof value === "string" && value.includes("T")) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    }
  }

  return String(value);
}
