import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const allowedTables = {
  users_profile: ["created_at", "email", "full_name", "phone", "role"],
  waitlist_signups: ["created_at", "first_name", "last_name", "email", "city", "role"],
  realtor_profiles: ["created_at", "name", "email", "phone", "brokerage", "market", "approval_status"],
  realtor_signups: ["created_at", "name", "email", "phone", "brokerage", "market"],
  listings: ["created_at", "address_line_1", "city", "state", "zip", "price", "status", "approval_status", "source_type"],
  listing_enrichment: ["updated_at", "listing_id", "flood_data", "crime_data", "unavailable_data"],
  leads: ["created_at", "first_name", "last_name", "email", "phone", "status", "message"],
  contact_messages: ["created_at", "name", "email", "phone", "subject", "message", "status"],
  audit_logs: ["created_at", "action", "entity_type", "entity_id"],
} as const;

const orderColumns: Record<keyof typeof allowedTables, string> = {
  users_profile: "created_at",
  waitlist_signups: "created_at",
  realtor_profiles: "created_at",
  realtor_signups: "created_at",
  listings: "created_at",
  listing_enrichment: "updated_at",
  leads: "created_at",
  contact_messages: "created_at",
  audit_logs: "created_at",
};

export async function GET(request: Request) {
  const cookieStore = await cookies();

  if (cookieStore.get("askhero_admin")?.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const table = searchParams.get("table");

  if (!table || !(table in allowedTables)) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }

  const columns = allowedTables[table as keyof typeof allowedTables];
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from(table)
    .select(columns.join(","))
    .order(orderColumns[table as keyof typeof allowedTables], { ascending: false });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to export CSV" }, { status: 500 });
  }

  const rows = (data || []) as unknown as Record<string, unknown>[];
  const csv = toCsv(columns, rows);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${table}.csv"`,
    },
  });
}

function toCsv(columns: readonly string[], rows: Record<string, unknown>[]) {
  return [
    columns.join(","),
    ...rows.map((row) =>
      columns.map((column) => csvCell(row[column])).join(","),
    ),
  ].join("\n");
}

function csvCell(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value);
  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }

  return stringValue;
}
