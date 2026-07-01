import { NextResponse } from "next/server";
import { sendMail } from "@/lib/email/mailer";
import { buyerWelcomeEmail } from "@/lib/email/templates/buyer-welcome";
import { sellerWelcomeEmail } from "@/lib/email/templates/seller-welcome";
import { realtorWelcomeEmail } from "@/lib/email/templates/realtor-welcome";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { email, name, role } = (body ?? {}) as Record<string, unknown>;

  if (typeof email !== "string" || !email) {
    return NextResponse.json({ error: "email is required." }, { status: 400 });
  }
  if (typeof name !== "string" || !name) {
    return NextResponse.json({ error: "name is required." }, { status: 400 });
  }
  if (typeof role !== "string" || !role) {
    return NextResponse.json({ error: "role is required." }, { status: 400 });
  }

  const template =
    role === "realtor"
      ? realtorWelcomeEmail(name)
      : role === "seller"
        ? sellerWelcomeEmail(name)
        : buyerWelcomeEmail(name);

  try {
    await sendMail({ to: email, ...template });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[welcome-email]", error);
    return NextResponse.json({ error: "Failed to send welcome email." }, { status: 500 });
  }
}
