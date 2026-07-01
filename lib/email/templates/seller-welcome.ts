export function sellerWelcomeEmail(name: string) {
  const subject = "Your home is listed on AskHero — here's what happens next";

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
          <h1 style="margin:0;font-size:22px;font-weight:600;color:#ffffff;line-height:1.3">Your listing is live, ${name}.</h1>
          <p style="margin:12px 0 0;font-size:15px;color:rgba(255,255,255,0.65)">Here's what happens from here.</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:36px 40px">
          <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:rgba(232,234,240,0.85)">
            Your home is now visible to buyers on AskHero. Every listing on our platform gets a <strong style="color:#f5c842">Hero Score™</strong> — a data-driven rating that helps serious buyers evaluate your home against crime stats, school quality, flood risk, and more.
          </p>
          <!-- Steps -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="32" valign="top" style="padding-top:2px"><span style="display:inline-block;width:24px;height:24px;background:#f5c842;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;color:#0b1220">1</span></td>
              <td style="padding-left:12px;padding-bottom:20px">
                <p style="margin:0;font-size:14px;font-weight:600;color:#ffffff">Review pending</p>
                <p style="margin:4px 0 0;font-size:13px;color:rgba(232,234,240,0.65)">Our team reviews your listing to confirm details are accurate before it's promoted to the top of search results.</p>
              </td>
            </tr>
            <tr>
              <td width="32" valign="top" style="padding-top:2px"><span style="display:inline-block;width:24px;height:24px;background:#f5c842;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;color:#0b1220">2</span></td>
              <td style="padding-left:12px;padding-bottom:20px">
                <p style="margin:0;font-size:14px;font-weight:600;color:#ffffff">Hero Score™ assigned</p>
                <p style="margin:4px 0 0;font-size:13px;color:rgba(232,234,240,0.65)">We enrich your listing with neighborhood data and assign a Hero Score so buyers can see the full picture.</p>
              </td>
            </tr>
            <tr>
              <td width="32" valign="top" style="padding-top:2px"><span style="display:inline-block;width:24px;height:24px;background:#f5c842;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;color:#0b1220">3</span></td>
              <td style="padding-left:12px">
                <p style="margin:0;font-size:14px;font-weight:600;color:#ffffff">Buyer leads arrive</p>
                <p style="margin:4px 0 0;font-size:13px;color:rgba(232,234,240,0.65)">Interested buyers contact you directly through AskHero. We notify you by email for every new inquiry.</p>
              </td>
            </tr>
          </table>
          <!-- CTA -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px">
            <tr><td align="center">
              <a href="https://askhero.net/listings" style="display:inline-block;background:#f5c842;color:#0b1220;font-size:15px;font-weight:700;padding:14px 36px;border-radius:8px;text-decoration:none">View Your Listing →</a>
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

  const text = `Your home is listed on AskHero, ${name}.

Here's what happens from here:

1. Review pending — Our team reviews your listing to confirm details are accurate before it's promoted to search results.

2. Hero Score™ assigned — We enrich your listing with neighborhood data so buyers can see the full picture.

3. Buyer leads arrive — Interested buyers contact you directly through AskHero. We notify you by email for every new inquiry.

View your listing: https://askhero.net/listings

Questions? Reach us at support@askhero.net.

— The AskHero Team`;

  return { subject, html, text };
}
