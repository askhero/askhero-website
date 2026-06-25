import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { setAskHeroSession } from "@/lib/auth/session";
import { sendNotificationEmail } from "@/lib/email";
import { getClientKey, rateLimit } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { cleanOptional, realtorSchema } from "@/lib/validation";

type RealtorSignupPayload = {
  name: string;
  email: string;
  phone: string;
  brokerage: string;
  market: string;
};

export async function POST(request: Request) {
  if (!rateLimit(getClientKey(request, "realtor")).allowed) {
    return NextResponse.json({ error: "Too many attempts. Please try again soon." }, { status: 429 });
  }

  const raw = await request.json().catch(() => null);
  if (raw?.company) {
    return NextResponse.json({ success: true });
  }

  const payload = realtorSchema.safeParse(raw);

  if (!payload.success) {
    return NextResponse.json({ error: payload.error.issues[0]?.message || "Please check the realtor form." }, { status: 400 });
  }

  const signup = payload.data as RealtorSignupPayload;

  try {
    const supabase = createSupabaseAdminClient();
    const email = signup.email.toLowerCase();
    const phone = normalizePhone(signup.phone);
    const { data: existingProfile } = await supabase
      .from("users_profile")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    const userId = existingProfile?.id || randomUUID();

    const profilePayload = {
      email,
      full_name: signup.name,
      phone,
      role: "realtor",
      target_markets: [signup.market],
      updated_at: new Date().toISOString(),
    };
    if (existingProfile?.id) {
      await supabase.from("users_profile").update(profilePayload).eq("id", existingProfile.id);
    } else {
      await supabase.from("users_profile").insert({ id: userId, ...profilePayload });
    }

    const { data: existingRealtorProfile } = await supabase
      .from("realtor_profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    const realtorProfile = {
      user_id: userId,
      name: signup.name,
      email,
      phone,
      brokerage: signup.brokerage,
      market: signup.market,
      approval_status: "pending",
      updated_at: new Date().toISOString(),
    };
    if (existingRealtorProfile?.id) {
      await supabase.from("realtor_profiles").update(realtorProfile).eq("id", existingRealtorProfile.id);
    } else {
      await supabase.from("realtor_profiles").insert(realtorProfile);
    }

    await supabase.from("agents").insert({
      full_name: signup.name,
      email,
      phone,
      brokerage: signup.brokerage,
      market: signup.market,
      status: "launch_signup",
      metadata: { source: "realtor_signup" },
    });

    const { error } = await supabase.from("realtor_signups").insert({
      name: signup.name,
      email,
      phone: cleanOptional(phone),
      brokerage: signup.brokerage,
      market: signup.market,
    });

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Unable to send realtor signup." }, { status: 500 });
    }

    await sendNotificationEmail({
      subject: "New AskHero realtor signup",
      replyTo: signup.email,
      lines: [
        `Name: ${signup.name}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        `Brokerage: ${signup.brokerage}`,
        `Market: ${signup.market}`,
      ],
    });

    await setAskHeroSession({ email, role: "realtor", fullName: signup.name });

    return NextResponse.json({
      success: true,
      message: "Thank you for signing up for launch. You can now create a free Hero listing with Hero Listing Builder™ and list homes faster.",
      next: "/dashboard/listings/new",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to send realtor signup." }, { status: 500 });
  }
}

function normalizePhone(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith("+")) return trimmed;
  const digits = trimmed.replace(/\D/g, "");
  return digits.length === 10 ? `+1${digits}` : `+${digits}`;
}
