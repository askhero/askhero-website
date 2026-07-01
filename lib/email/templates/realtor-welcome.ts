export function realtorWelcomeEmail(name: string) {
  const subject = "Welcome Hero Agent — here's how to get leads from AskHero";

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0b1220;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e8eaf0">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b1220;padding:40px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111827;border-radius:12px;border:1px solid rgba(255,255,255,0.08);overflow:hidden">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#0f1f3d 0%,#1a3160 100%);padding:40px 40px 32px;text-align:center">
          <p style="margin:0 0 16px;font-size:28px;font-weight:700;color:#f5c842;letter-spacing:-0.5px">AskHero</p>
          <h1 style="margin:0;font-size:22px;font-weight:600;color:#ffffff;line-height:1.3">Welcome to the team, ${name}.</h1>
          <p style="margin:12px 0 0;font-size:15px;color:rgba(255,255,255,0.65)">You're now a Hero Agent on AskHero.</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:36px 40px">
          <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:rgba(232,234,240,0.85)">
            AskHero connects Charlotte's most serious buyers — people who've already researched Hero Scores, reviewed neighborhood data, and are ready to act. As a Hero Agent, you're their first call.
          </p>
          <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:rgba(232,234,240,0.85)">Here's how to get the most out of your profile:</p>
          <!-- Feature list -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:14px 16px;background:rgba(245,200,66,0.06);border:1px solid rgba(245,200,66,0.15);border-radius:8px;margin-bottom:10px">
              <p style="margin:0;font-size:14px;font-weight:600;color:#f5c842">✅ Get approved</p>
              <p style="margin:6px 0 0;font-size:13px;color:rgba(232,234,240,0.7)">Our team reviews your profile before you go live. We'll email you once you're approved and visible to buyers.</p>
            </td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px">
            <tr><td style="padding:14px 16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:8px">
              <p style="margin:0;font-size:14px;font-weight:600;color:#ffffff">📋 Complete your profile</p>
              <p style="margin:6px 0 0;font-size:13px;color:rgba(232,234,240,0.7)">Add your brokerage, markets, specialties, and a photo. Complete profiles get 3× more buyer inquiries.</p>
            </td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px">
            <tr><td style="padding:14px 16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:8px">
              <p style="margin:0;font-size:14px;font-weight:600;color:#ffffff">🏠 List properties</p>
              <p style="margin:6px 0 0;font-size:13px;color:rgba(232,234,240,0.7)">Submit listings directly through AskHero. Each listing is enriched with a Hero Score™ that helps your homes stand out.</p>
            </td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px">
            <tr><td style="padding:14px 16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:8px">
              <p style="margin:0;font-size:14px;font-weight:600;color:#ffffff">📩 Receive buyer leads</p>
              <p style="margin:6px 0 0;font-size:13px;color:rgba(232,234,240,0.7)">When a buyer requests a showing or asks a question, we send it straight to your inbox. No platform middleman.</p>
            </td></tr>
          </table>
          <!-- CTA -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px">
            <tr><td align="center">
              <a href="https://askhero.net/listings" style="display:inline-block;background:#f5c842;color:#0b1220;font-size:15px;font-weight:700;padding:14px 36px;border-radius:8px;text-decoration:none">View AskHero Listings →</a>
            </td></tr>
          </table>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:24px 40px;border-top:1px solid rgba(255,255,255,0.08);text-align:center">
          <p style="margin:0;font-size:12px;color:rgba(232,234,240,0.35)">AskHero · Charlotte, NC · <a href="https://askhero.net" style="color:rgba(245,200,66,0.6);text-decoration:none">askhero.net</a></p>
          <p style="margin:8px 0 0;font-size:12px;color:rgba(232,234,240,0.35)">Questions? Contact <a href="mailto:support@askhero.net" style="color:rgba(245,200,66,0.6);text-decoration:none">support@askhero.net</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Welcome to the team, ${name}!

You're now a Hero Agent on AskHero.

AskHero connects Charlotte's most serious buyers — people who've already researched Hero Scores and are ready to act.

Here's how to get the most out of your profile:

✅ Get approved — Our team reviews your profile before you go live. We'll email you once approved.

📋 Complete your profile — Add your brokerage, markets, specialties, and a photo. Complete profiles get 3× more buyer inquiries.

🏠 List properties — Submit listings directly through AskHero. Each listing gets a Hero Score™ that helps your homes stand out.

📩 Receive buyer leads — When a buyer requests a showing, we send it straight to your inbox. No platform middleman.

View listings: https://askhero.net/listings

Questions? Reach us at support@askhero.net.

— The AskHero Team`;

  return { subject, html, text };
}
