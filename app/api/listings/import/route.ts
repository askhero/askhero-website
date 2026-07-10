import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getClientKey, rateLimit } from "@/lib/rate-limit";

const anthropic = new Anthropic();

export type ImportedListing = {
  address_line_1: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  price: number | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  year_built: number | null;
  lot_size: number | null;
  property_type: string | null;
  description: string | null;
  images: string[];
  listing_agent_name: string | null;
  listing_agent_phone: string | null;
  listing_agent_email: string | null;
  brokerage_name: string | null;
  hoa_fee: number | null;
  parking: string | null;
  features: string[];
};

const BOT_SIGNALS = [
  "captcha",
  "access denied",
  "blocked",
  "cf-error",
  "cloudflare",
  "enable javascript",
  "please wait",
  "ddos",
  "blob:http://",
  "temporary error",
  "please try again",
  "error occurred",
];

function botSignalHit(content: string): string | undefined {
  const lower = content.toLowerCase();
  return BOT_SIGNALS.find((s) => lower.includes(s));
}

// Extract ONLY JSON-LD blocks from HTML. Returns null if none found or combined length < minLen.
function extractJsonLdOnly(html: string, minLen = 200): string | null {
  const blocks: string[] = [];
  const pattern = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(html)) !== null) {
    const raw = m[1]?.trim();
    if (raw) blocks.push(raw);
  }
  if (blocks.length === 0) return null;
  const combined = "=== JSON-LD STRUCTURED DATA ===\n" + blocks.join("\n\n");
  return combined.length >= minLen ? combined : null;
}

// Extract meta image tags and img src attributes from HTML.
function extractImageUrls(html: string): string[] {
  const urls: string[] = [];
  const isValidImgUrl = (u: string) => /^https?:\/\/.+\.(jpg|jpeg|png|webp)/i.test(u);

  // og:image / twitter:image (both attribute orderings)
  const ogPatterns = [
    /<meta[^>]+(?:property=["']og:image["']|name=["']twitter:image["'])[^>]*content=["']([^"']+)["'][^>]*>/gi,
    /<meta[^>]+content=["']([^"']+)["'][^>]*(?:property=["']og:image["']|name=["']twitter:image["'])[^>]*>/gi,
  ];
  for (const pat of ogPatterns) {
    let m: RegExpExecArray | null;
    while ((m = pat.exec(html)) !== null) {
      const u = m[1]?.trim();
      if (u && isValidImgUrl(u) && !urls.includes(u)) urls.push(u);
    }
  }

  // img src / data-src / srcset
  const imgPat = /<img[^>]+(?:src|data-src|srcset)=["']([^"']+)["'][^>]*>/gi;
  let im: RegExpExecArray | null;
  while ((im = imgPat.exec(html)) !== null) {
    const first = (im[1]?.trim() ?? "").split(/[\s,]+/)[0] ?? "";
    if (isValidImgUrl(first) && !urls.includes(first)) urls.push(first);
  }

  return urls.slice(0, 30);
}

// Full HTML → Claude-ready content string with all signals surfaced.
function prepareHtml(html: string): string {
  const jsonLdOnly = extractJsonLdOnly(html);
  const imageUrls = extractImageUrls(html);

  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  const sections: string[] = [];
  if (jsonLdOnly) sections.push(jsonLdOnly);
  if (imageUrls.length > 0) sections.push("=== IMAGE URLS ===\n" + imageUrls.join("\n"));
  sections.push("=== PAGE TEXT ===\n" + stripped);

  return sections.join("\n\n").slice(0, 50000);
}

function logContentPreview(strategy: string, content: string) {
  console.log(`[import] strategy=${strategy} content preview:`, content.substring(0, 500));
  console.log(`[import] strategy=${strategy} has json-ld:`, content.toLowerCase().includes("json-ld") || content.includes("application/ld+json"));
  console.log(`[import] strategy=${strategy} has price:`, content.includes("$") || content.toLowerCase().includes("price"));
}

const CLAUDE_SYSTEM = `You are a real estate data extractor. Extract listing data from the provided content. Return ONLY a valid JSON object — no markdown, no backticks, no explanation, just raw JSON.

EXTRACTION PRIORITY ORDER:
1. JSON-LD structured data (labeled "=== JSON-LD STRUCTURED DATA ===") — most accurate
2. Image URLs (labeled "=== IMAGE URLS ===") — use for the images array
3. Page text (labeled "=== PAGE TEXT ===") — fill in any gaps

Look everywhere for these fields — JSON-LD data, meta tags, and visible text:
- property description: any text block describing the home
- year_built: "built in YYYY", "year built", "vintage"
- lot_size: "X acres", "X sq ft lot", "lot size"
- hoa_fee: "HOA", "monthly fee", "homeowners association"
- parking: "garage", "carport", "parking spaces"
- listing_agent_name: agent/listing agent/contact name
- listing_agent_phone: any phone number near agent info
- brokerage_name: brokerage, realty, real estate company name
- features: any bullet points, amenities list, highlights, or feature list

For images: include every URL from the "=== IMAGE URLS ===" section plus any image URLs
found in JSON-LD (look for "image", "photo", "thumbnail" properties). Only include absolute
URLs ending in .jpg .jpeg .png .webp. Max 20 images total.

Required JSON format:
{
  "address_line_1": "string or null",
  "city": "string or null",
  "state": "2-letter state code or null",
  "zip": "string or null",
  "price": "number or null",
  "beds": "number or null",
  "baths": "number or null",
  "sqft": "number or null",
  "year_built": "number or null",
  "lot_size": "number in acres or null",
  "property_type": "Single Family, Condo, Townhouse, Multi-Family, Land, or Commercial — or null",
  "description": "string or null",
  "images": [],
  "listing_agent_name": "string or null",
  "listing_agent_phone": "string or null",
  "listing_agent_email": "string or null",
  "brokerage_name": "string or null",
  "hoa_fee": "monthly dollar amount as number or null",
  "parking": "string or null",
  "features": []
}

If a field is not found after searching everywhere, use null. Use [] for empty arrays.`;

async function extractWithClaude(
  content: string,
  strategyName: string,
): Promise<{ success: true; listing: ImportedListing; strategy: string } | { success: false; error: string }> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: CLAUDE_SYSTEM,
    messages: [{ role: "user", content }],
  });

  const raw = message.content[0]?.type === "text" ? message.content[0].text : "";
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  try {
    const listing = JSON.parse(cleaned) as ImportedListing;
    listing.images = Array.isArray(listing.images) ? listing.images.slice(0, 20) : [];
    listing.features = Array.isArray(listing.features) ? listing.features.slice(0, 10) : [];
    return { success: true, listing, strategy: strategyName };
  } catch (err) {
    console.error(`[import] Claude parse failed strategy=${strategyName}:`, err, "raw:", raw.slice(0, 300));
    return { success: false, error: "Failed to parse extracted listing data." };
  }
}

// Shared direct fetch headers
const STEALTH_HEADERS: HeadersInit = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
  Referer: "https://www.google.com/",
  DNT: "1",
};

export async function POST(request: Request) {
  if (!rateLimit(getClientKey(request, "listing-import"), 10, 60_000).allowed) {
    return NextResponse.json({ error: "Too many attempts. Please try again soon." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const { url, pastedText } = body as { url?: string; pastedText?: string };

  // Pasted text path — skip all fetch strategies
  if (pastedText && typeof pastedText === "string" && pastedText.trim().length > 50) {
    console.log("[import] strategy=paste length=%d", pastedText.trim().length);
    const result = await extractWithClaude(pastedText.trim().slice(0, 50000), "paste");
    if (result.success) return NextResponse.json(result);
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "A URL or pasted text is required." }, { status: 400 });
  }

  console.log("[import] starting strategy cascade url=%s", url);

  // ── Strategy 1: Zillow/Trulia fast-fail ────────────────────────────────────
  if (url.includes("zillow.com") || url.includes("trulia.com")) {
    console.log("[import] strategy=zillow-block triggered");
    return NextResponse.json({
      success: false,
      fallback: true,
      reason: "zillow_blocked",
      message:
        "Zillow restricts automated access. Copy and paste the listing details into the text box below — we'll extract everything instantly.",
    });
  }

  // ── Strategy 2: Jina.ai (renders JS, returns clean markdown) ───────────────
  // Primary strategy — Jina renders the page server-side and returns markdown.
  // Minimum 1000 chars to filter out error pages (error pages are ~300-600 chars).
  try {
    console.log("[import] strategy=jina attempting fetch");
    const jinaRes = await fetch(`https://r.jina.ai/${url}`, {
      headers: {
        Accept: "application/json",
        "X-Return-Format": "markdown",
        "X-Timeout": "30",
        "X-No-Cache": "true",
      },
      signal: AbortSignal.timeout(25000),
    });
    console.log("[import] strategy=jina status=%d", jinaRes.status);
    if (jinaRes.ok) {
      const jinaData = (await jinaRes.json()) as { content?: string; data?: { content?: string } };
      const content = jinaData.content ?? jinaData.data?.content ?? "";
      const hit = botSignalHit(content);
      console.log("[import] strategy=jina content_length=%d bot=%s", content.length, hit ?? "none");
      if (content.length >= 1000 && !hit) {
        logContentPreview("jina", content);
        const result = await extractWithClaude(content.slice(0, 50000), "jina");
        if (result.success) return NextResponse.json(result);
        console.error("[import] strategy=jina claude failed:", result.error);
      } else {
        console.error("[import] strategy=jina rejected: length=%d bot=%s", content.length, hit ?? "none");
      }
    } else {
      const text = await jinaRes.text().catch(() => "");
      console.error("[import] strategy=jina non-ok status=%d body=%s", jinaRes.status, text.slice(0, 200));
    }
  } catch (err) {
    console.error("[import] strategy=jina threw:", err instanceof Error ? err.message : err);
  }

  // ── Strategy 3: Direct fetch → JSON-LD only ────────────────────────────────
  // Redfin and most MLS sites embed complete listing data in JSON-LD even though
  // the visible page requires JavaScript. Extract only the JSON-LD blocks —
  // much cleaner than sending 800k of minified JS bundle to Claude.
  try {
    console.log("[import] strategy=direct-jsonld attempting fetch");
    const directRes = await fetch(url, {
      headers: STEALTH_HEADERS,
      signal: AbortSignal.timeout(15000),
    });
    console.log("[import] strategy=direct-jsonld status=%d", directRes.status);
    if (directRes.ok) {
      const html = await directRes.text();
      console.log("[import] strategy=direct-jsonld raw_html_length=%d", html.length);
      const jsonLdContent = extractJsonLdOnly(html, 200);
      if (jsonLdContent) {
        // Augment JSON-LD with any image URLs found in the HTML
        const imageUrls = extractImageUrls(html);
        const content = imageUrls.length > 0
          ? jsonLdContent + "\n\n=== IMAGE URLS ===\n" + imageUrls.join("\n")
          : jsonLdContent;
        const hit = botSignalHit(content);
        console.log("[import] strategy=direct-jsonld jsonld_length=%d images=%d bot=%s", jsonLdContent.length, imageUrls.length, hit ?? "none");
        if (!hit) {
          logContentPreview("direct-jsonld", content);
          const result = await extractWithClaude(content.slice(0, 50000), "direct-jsonld");
          if (result.success) return NextResponse.json(result);
          console.error("[import] strategy=direct-jsonld claude failed:", result.error);
        }
      } else {
        console.error("[import] strategy=direct-jsonld no JSON-LD found in %d char response — falling through", html.length);
        // No JSON-LD: try full prepareHtml as fallback within this strategy
        const content = prepareHtml(html);
        const hit = botSignalHit(content);
        console.log("[import] strategy=direct-full prepared=%d bot=%s", content.length, hit ?? "none");
        if (content.length > 1000 && !hit) {
          logContentPreview("direct-full", content);
          const result = await extractWithClaude(content, "direct-full");
          if (result.success) return NextResponse.json(result);
          console.error("[import] strategy=direct-full claude failed:", result.error);
        }
      }
    } else {
      const text = await directRes.text().catch(() => "");
      console.error("[import] strategy=direct-jsonld non-ok status=%d body=%s", directRes.status, text.slice(0, 200));
    }
  } catch (err) {
    console.error("[import] strategy=direct-jsonld threw:", err instanceof Error ? err.message : err);
  }

  // ── Strategy 4: Google cache → JSON-LD only ────────────────────────────────
  // Google cache returns 91k of JS-heavy HTML where stripping leaves ~180 chars.
  // But the cached HTML may still contain JSON-LD from the original page.
  // If no JSON-LD found, skip rather than sending useless JS bundle to Claude.
  try {
    console.log("[import] strategy=google-cache attempting fetch");
    const cacheRes = await fetch(
      `https://webcache.googleusercontent.com/search?q=cache:${encodeURIComponent(url)}`,
      { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }, signal: AbortSignal.timeout(15000) },
    );
    console.log("[import] strategy=google-cache status=%d", cacheRes.status);
    if (cacheRes.ok) {
      const html = await cacheRes.text();
      console.log("[import] strategy=google-cache raw_html_length=%d", html.length);
      const jsonLdContent = extractJsonLdOnly(html, 200);
      if (jsonLdContent) {
        const imageUrls = extractImageUrls(html);
        const content = imageUrls.length > 0
          ? jsonLdContent + "\n\n=== IMAGE URLS ===\n" + imageUrls.join("\n")
          : jsonLdContent;
        const hit = botSignalHit(content);
        console.log("[import] strategy=google-cache jsonld_length=%d images=%d bot=%s", jsonLdContent.length, imageUrls.length, hit ?? "none");
        if (!hit) {
          logContentPreview("google-cache", content);
          const result = await extractWithClaude(content.slice(0, 50000), "google-cache");
          if (result.success) return NextResponse.json(result);
          console.error("[import] strategy=google-cache claude failed:", result.error);
        }
      } else {
        console.error("[import] strategy=google-cache no JSON-LD found — skipping (would send useless JS bundle)");
      }
    } else {
      const text = await cacheRes.text().catch(() => "");
      console.error("[import] strategy=google-cache non-ok status=%d body=%s", cacheRes.status, text.slice(0, 200));
    }
  } catch (err) {
    console.error("[import] strategy=google-cache threw:", err instanceof Error ? err.message : err);
  }

  // ── Strategy 5: AllOrigins proxy (last resort) ─────────────────────────────
  try {
    console.log("[import] strategy=allorigins attempting fetch");
    const allOriginsRes = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
    console.log("[import] strategy=allorigins status=%d", allOriginsRes.status);
    if (allOriginsRes.ok) {
      const data = (await allOriginsRes.json()) as { contents?: string };
      const raw = data.contents ?? "";
      const jsonLdContent = raw.startsWith("<") ? extractJsonLdOnly(raw) : null;
      const content = jsonLdContent ?? (raw.startsWith("<") ? prepareHtml(raw) : raw.slice(0, 50000));
      const hit = botSignalHit(content);
      console.log("[import] strategy=allorigins raw=%d content=%d used=%s bot=%s",
        raw.length, content.length, jsonLdContent ? "jsonld" : "prepared", hit ?? "none");
      if (content.length > 500 && !hit) {
        logContentPreview("allorigins", content);
        const result = await extractWithClaude(content, "allorigins");
        if (result.success) return NextResponse.json(result);
        console.error("[import] strategy=allorigins claude failed:", result.error);
      } else {
        console.error("[import] strategy=allorigins rejected: length=%d bot=%s", content.length, hit ?? "none");
      }
    } else {
      const text = await allOriginsRes.text().catch(() => "");
      console.error("[import] strategy=allorigins non-ok status=%d body=%s", allOriginsRes.status, text.slice(0, 200));
    }
  } catch (err) {
    console.error("[import] strategy=allorigins threw:", err instanceof Error ? err.message : err);
  }

  console.error("[import] all strategies failed url=%s", url);
  return NextResponse.json({
    success: false,
    fallback: true,
    message:
      "Couldn't auto-fetch this listing. Paste the listing details below and we'll extract everything for you.",
  });
}
