import "server-only";

import nodemailer from "nodemailer";

type ZohoMailPayload = {
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  fromName?: string;
};

export async function sendZohoMail({ subject, text, html, replyTo, fromName }: ZohoMailPayload) {
  const host = requiredEnv("ZOHO_SMTP_HOST");
  const port = Number(requiredEnv("ZOHO_SMTP_PORT"));
  const user = requiredEnv("ZOHO_SMTP_USER");
  const pass = requiredEnv("ZOHO_SMTP_PASS");
  const fromEmail = requiredEnv("ZOHO_FROM_EMAIL");
  const toEmail = requiredEnv("CONTACT_TO_EMAIL");

  if (!Number.isFinite(port) || port <= 0) {
    throw new Error("ZOHO_SMTP_PORT must be a valid port number.");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  const info = await transporter.sendMail({
    from: {
      name: cleanHeaderName(fromName || "AskHero Contact Form"),
      address: fromEmail,
    },
    to: toEmail,
    replyTo,
    subject,
    text,
    html,
  });

  if (info.rejected.length > 0 || info.accepted.length === 0) {
    throw new Error(`Zoho rejected contact notification for ${info.rejected.join(", ") || toEmail}.`);
  }

  return info;
}

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required Zoho email environment variable: ${name}.`);
  }
  return value;
}

function cleanHeaderName(value: string) {
  return value.replace(/[\r\n"]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}