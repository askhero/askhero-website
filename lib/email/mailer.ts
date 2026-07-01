import "server-only";

import nodemailer from "nodemailer";

export type MailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

function createTransporter() {
  const host = requiredEnv("ZOHO_SMTP_HOST");
  const port = Number(requiredEnv("ZOHO_SMTP_PORT"));
  const user = requiredEnv("ZOHO_SMTP_USER");
  const pass = requiredEnv("ZOHO_SMTP_PASS");

  if (!Number.isFinite(port) || port <= 0) {
    throw new Error("ZOHO_SMTP_PORT must be a valid port number.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendMail({ to, subject, html, text }: MailPayload) {
  const fromEmail = requiredEnv("ZOHO_FROM_EMAIL");
  const transporter = createTransporter();

  const info = await transporter.sendMail({
    from: { name: "AskHero", address: fromEmail },
    replyTo: "support@askhero.net",
    to,
    subject,
    html,
    text,
  });

  if (info.rejected.length > 0 || info.accepted.length === 0) {
    throw new Error(
      `Mail rejected for ${info.rejected.join(", ") || to}.`,
    );
  }

  return info;
}

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}
