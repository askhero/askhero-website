import { NextResponse } from "next/server";
import { sendNotificationEmail } from "@/lib/email";
import { getClientKey, rateLimit } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { cleanOptional, waitlistSchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (!rateLimit(getClientKey(request, "waitlist")).allowed) {
    return NextResponse.json({ error: "Too many attempts. Please try again soon." }, { status: 429 });
  }

  const raw = await request.json().catch(() => null);
  if (raw?.company) {
    return NextResponse.json({ success: true });
  }

  const payload = waitlistSchema.safeParse(raw);

  if (!payload.success) {
    return NextResponse.json({ error: "Please check the waitlist form." }, { status: 400 });
  }

  const signup = payload.data;

  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("waitlist_signups").insert({
      first_name: signup.first_name,
      last_name: signup.last_name,
      email: signup.email.toLowerCase(),
      city: cleanOptional(signup.city),
      role: signup.role,
    });

    if (error?.code === "23505") {
      return NextResponse.json(
        { error: "This email is already on the waitlist." },
        { status: 409 },
      );
    }

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Unable to join waitlist." }, { status: 500 });
    }

    await sendNotificationEmail({
      subject: "New AskHero waitlist signup",
      replyTo: signup.email,
      lines: [
        `Name: ${signup.first_name} ${signup.last_name}`,
        `Email: ${signup.email}`,
        `City: ${signup.city || "Not provided"}`,
        `Role: ${signup.role}`,
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to join waitlist." }, { status: 500 });
  }
}
