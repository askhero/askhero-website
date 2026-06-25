import { NextResponse } from "next/server";
import { sendTemplateEmail } from "@/lib/email";
import { getClientKey, rateLimit } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { cleanOptional, leadSchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (!rateLimit(getClientKey(request, "lead"), 6, 60_000).allowed) {
    return NextResponse.json({ error: "Too many attempts. Please try again soon." }, { status: 429 });
  }

  const raw = await request.json().catch(() => null);
  if (raw?.company) {
    return NextResponse.json({ success: true });
  }

  const payload = leadSchema.safeParse(raw);
  if (!payload.success) {
    return NextResponse.json({ error: "Please check the lead form." }, { status: 400 });
  }

  const lead = payload.data;
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("leads").insert({
    listing_id: lead.listing_id || null,
    first_name: lead.first_name,
    last_name: lead.last_name,
    email: lead.email.toLowerCase(),
    phone: cleanOptional(lead.phone),
    message: lead.message,
    status: "New",
  });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to create lead." }, { status: 500 });
  }

  await sendTemplateEmail({
    to: lead.email,
    subject: "AskHero received your agent request",
    html: `<p>Thanks ${lead.first_name}. AskHero received your request and will follow up as launch availability develops.</p>`,
  });

  if (process.env.ADMIN_EMAIL) {
    await sendTemplateEmail({
      to: process.env.ADMIN_EMAIL,
      subject: "New AskHero buyer lead",
      html: `<p>${lead.first_name} ${lead.last_name} requested an agent connection.</p><p>${lead.message}</p>`,
      replyTo: lead.email,
    });
  }

  return NextResponse.json({ success: true });
}
