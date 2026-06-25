import { Resend } from "resend";

const notificationAddress = "hello@askhero.net";
const defaultFromAddress = "AskHero <hello@askhero.net>";

export async function sendNotificationEmail({
  subject,
  lines,
  replyTo,
  to,
  from,
}: {
  subject: string;
  lines: string[];
  replyTo?: string;
  to?: string;
  from?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn("RESEND_API_KEY is not configured. Skipping notification email.");
    return;
  }

  const resend = new Resend(apiKey);
  const html = `
    <div style="font-family: Arial, sans-serif; color: #0b1728;">
      <h2>${escapeHtml(subject)}</h2>
      <ul>
        ${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}
      </ul>
    </div>
  `;

  await resend.emails.send({
    from: from || defaultFromAddress,
    to: to || process.env.ADMIN_EMAIL || notificationAddress,
    replyTo,
    subject,
    html,
  });
}

export async function sendTemplateEmail({
  to,
  subject,
  html,
  from,
  replyTo,
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn("RESEND_API_KEY is not configured. Skipping template email.");
    return;
  }

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: from || `AskHero <${process.env.CONNECT_EMAIL || "connect@askhero.net"}>`,
    to,
    replyTo,
    subject,
    html,
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
