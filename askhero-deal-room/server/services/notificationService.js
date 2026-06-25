import { Resend } from "resend";
import twilio from "twilio";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const sms = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export async function sendEmail({ to, subject, html }) {
  if (!resend) return;
  await resend.emails.send({
    from: "AskHero <connect@askhero.net>",
    to,
    subject,
    html
  });
}

export async function sendSms({ to, body }) {
  if (!sms || !to || !process.env.TWILIO_PHONE_NUMBER) return;
  await sms.messages.create({
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
    body
  });
}
