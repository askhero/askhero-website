import { NextResponse } from "next/server";
import { sendZohoMail } from "@/lib/email/sendZohoMail";
import { getClientKey, rateLimit } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { cleanOptional, contactSchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (!rateLimit(getClientKey(request, "contact")).allowed) {
    return NextResponse.json(
      { ok: false, success: false, error: "Too many attempts. Please try again soon." },
      { status: 429 },
    );
  }

  const raw = await request.json().catch(() => null);
  if (raw?.company) {
    return NextResponse.json({ ok: true, success: true });
  }

  const payload = contactSchema.safeParse(raw);

  if (!payload.success) {
    return NextResponse.json(
      { ok: false, success: false, error: "Please check the contact form." },
      { status: 400 },
    );
  }

  const message = payload.data;
  const createdAt = new Date().toISOString();
  const subject = message.subject || "New message from website";
  const sourcePage = cleanOptional(message.sourcePage);
  const metadata = {
    source_page: sourcePage,
    user_agent: request.headers.get("user-agent"),
  };

  try {
    const supabase = createSupabaseAdminClient();
    const { data: savedMessage, error } = await supabase
      .from("contact_messages")
      .insert({
        name: message.name,
        email: message.email,
        phone: cleanOptional(message.phone),
        subject: cleanOptional(message.subject),
        message: message.message,
        source: "contact_form",
        status: "new",
        metadata,
        created_at: createdAt,
      })
      .select("id")
      .single();

    if (error || !savedMessage) {
      console.error("Contact message insert failed", error);
      return NextResponse.json(
        { ok: false, success: false, error: "Unable to save message." },
        { status: 500 },
      );
    }

    try {
      const emailInfo = await sendZohoMail({
        subject: `[AskHero Contact] ${message.name} <${message.email}> - ${subject}`,
        replyTo: message.email,
        fromName: `${message.name} via AskHero`,
        html: buildContactEmailHtml({
          name: message.name,
          email: message.email,
          phone: message.phone,
          subject: message.subject,
          message: message.message,
          createdAt,
          sourcePage,
        }),
        text: buildContactEmailText({
          name: message.name,
          email: message.email,
          phone: message.phone,
          subject: message.subject,
          message: message.message,
          createdAt,
          sourcePage,
        }),
      });

      await supabase
        .from("contact_messages")
        .update({
          status: "emailed",
          metadata: {
            ...metadata,
            email_message_id: emailInfo.messageId,
            email_accepted: emailInfo.accepted,
          },
        })
        .eq("id", savedMessage.id);
    } catch (emailError) {
      console.error("Zoho contact email failed", emailError);
      await supabase
        .from("contact_messages")
        .update({
          status: "email_failed",
          metadata: {
            ...metadata,
            email_error: emailError instanceof Error ? emailError.message : "Unknown Zoho email error",
          },
        })
        .eq("id", savedMessage.id);

      return NextResponse.json(
        {
          ok: false,
          success: false,
          error: "Your message was saved, but the email notification failed. Please check Zoho SMTP settings.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, success: true });
  } catch (error) {
    console.error("Contact route failed", error);
    return NextResponse.json(
      { ok: false, success: false, error: "Unable to send message." },
      { status: 500 },
    );
  }
}

function buildContactEmailText({
  name,
  email,
  phone,
  subject,
  message,
  createdAt,
  sourcePage,
}: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  createdAt: string;
  sourcePage: string | null;
}) {
  return [
    "New AskHero contact message",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || "Not provided"}`,
    `Subject: ${subject || "Not provided"}`,
    `Source page: ${sourcePage || "Not provided"}`,
    `Created: ${createdAt}`,
    "",
    "Message:",
    message,
  ].join("\n");
}
function buildContactEmailHtml({
  name,
  email,
  phone,
  subject,
  message,
  createdAt,
  sourcePage,
}: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  createdAt: string;
  sourcePage: string | null;
}) {
  return `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
      <h2 style="margin: 0 0 16px;">New AskHero contact message</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(phone || "Not provided")}</p>
      <p><strong>Subject:</strong> ${escapeHtml(subject || "Not provided")}</p>
      <p><strong>Source page:</strong> ${escapeHtml(sourcePage || "Not provided")}</p>
      <p><strong>Created:</strong> ${escapeHtml(createdAt)}</p>
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      <p style="white-space: pre-wrap;"><strong>Message:</strong><br />${escapeHtml(message)}</p>
    </div>
  `;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}