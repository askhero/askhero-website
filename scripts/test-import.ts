/**
 * Test each fetch strategy individually.
 * Run: npx ts-node --transpile-only scripts/test-import.ts
 */

// Load .env.local so ANTHROPIC_API_KEY is available outside Next.js
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import Anthropic from "@anthropic-ai/sdk";

const TEST_URLS = [
  "https://www.redfin.com/NC/Charlotte/8813-Thornton-Rd/home/179680777",
  "https://www.homes.com/property/653-lorain-ave-nw-concord-nc/ee62fv8r2gldr/",
];

const BOT_SIGNALS = [
  "captcha", "access denied", "blocked", "cf-error", "cloudflare",
  "enable javascript", "please wait", "ddos",
  "blob:http://", "temporary error", "please try again", "error occurred",
];

function botSignalHit(content: string): string | undefined {
  const lower = content.toLowerCase();
  return BOT_SIGNALS.find((s) => lower.includes(s));
}

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

function extractImageUrls(html: string): string[] {
  const urls: string[] = [];
  const isValidImgUrl = (u: string) => /^https?:\/\/.+\.(jpg|jpeg|png|webp)/i.test(u);
  const ogPat = /<meta[^>]+(?:property=["']og:image["']|name=["']twitter:image["'])[^>]*content=["']([^"']+)["'][^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = ogPat.exec(html)) !== null) {
    const u = m[1]?.trim();
    if (u && isValidImgUrl(u) && !urls.includes(u)) urls.push(u);
  }
  const imgPat = /<img[^>]+(?:src|data-src|srcset)=["']([^"']+)["'][^>]*>/gi;
  let im: RegExpExecArray | null;
  while ((im = imgPat.exec(html)) !== null) {
    const first = (im[1]?.trim() ?? "").split(/[\s,]+/)[0] ?? "";
    if (isValidImgUrl(first) && !urls.includes(first)) urls.push(first);
  }
  return urls.slice(0, 30);
}

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

const CLAUDE_SYSTEM = `You are a real estate data extractor. Extract listing data from the provided content. Return ONLY a valid JSON object — no markdown, no backticks, no explanation, just raw JSON.

EXTRACTION PRIORITY ORDER:
1. JSON-LD structured data (labeled "=== JSON-LD STRUCTURED DATA ===") — most accurate
2. Image URLs (labeled "=== IMAGE URLS ===") — use for the images array
3. Page text (labeled "=== PAGE TEXT ===") — fill in any gaps

Required format:
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
  "images": ["only absolute URLs ending in .jpg .jpeg .png .webp — max 20"],
  "listing_agent_name": "string or null",
  "listing_agent_phone": "string or null",
  "listing_agent_email": "string or null",
  "brokerage_name": "string or null",
  "hoa_fee": "monthly dollar amount as number or null",
  "parking": "string or null",
  "features": ["max 10 key features as strings"]
}

If a field is not found, use null. Use [] for empty arrays.`;

function pass(msg: string) { console.log("  ✅", msg); }
function fail(msg: string) { console.log("  ❌", msg); }
function info(msg: string) { console.log("  ℹ️ ", msg); }

async function runClaude(content: string): Promise<Record<string, unknown> | null> {
  const anthropic = new Anthropic();
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: CLAUDE_SYSTEM,
    messages: [{ role: "user", content }],
  });
  const raw = message.content[0]?.type === "text" ? message.content[0].text : "";
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  try {
    return JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    console.log("  ⚠️  Claude raw response:", raw.slice(0, 300));
    return null;
  }
}

function printExtraction(data: Record<string, unknown>) {
  const fields = ["address_line_1", "city", "state", "zip", "price", "beds", "baths", "sqft", "year_built", "property_type", "description", "listing_agent_name", "brokerage_name", "hoa_fee", "parking"];
  for (const f of fields) {
    const v = data[f];
    const val = v !== null && v !== undefined ? String(v).slice(0, 80) : "null";
    console.log(`     ${f}: ${val}`);
  }
  const images = data.images as string[] | undefined;
  const features = data.features as string[] | undefined;
  console.log(`     images: ${images?.length ?? 0} found → ${images?.slice(0, 2).join(", ") ?? "none"}`);
  console.log(`     features: ${features?.slice(0, 3).join(" | ") ?? "none"}`);
}

const STEALTH_HEADERS: HeadersInit = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
  Referer: "https://www.google.com/",
  DNT: "1",
};

// ── STRATEGY 2: Jina.ai ────────────────────────────────────────────────────
async function testJina(url: string, runExtraction: boolean): Promise<boolean> {
  console.log("\n  ── Strategy 2: Jina.ai (primary, min 1000 chars) ───────────");
  try {
    const res = await fetch(`https://r.jina.ai/${url}`, {
      headers: { Accept: "application/json", "X-Return-Format": "markdown", "X-Timeout": "30", "X-No-Cache": "true" },
      signal: AbortSignal.timeout(25000),
    });
    info(`HTTP ${res.status}`);
    if (!res.ok) { fail(`Non-OK: ${(await res.text().catch(() => "")).slice(0, 150)}`); return false; }
    const data = (await res.json()) as { content?: string; data?: { content?: string } };
    const content = data.content ?? data.data?.content ?? "";
    const hit = botSignalHit(content);
    info(`Content: ${content.length} chars | bot signal: ${hit ?? "none"}`);
    info(`Preview: ${content.slice(0, 300).replace(/\s+/g, " ")}`);
    if (content.length < 1000 || hit) { fail(`Rejected: ${hit ?? "too short (< 1000)"}`); return false; }
    pass("Jina content looks good");
    if (runExtraction) {
      info("Running Claude extraction…");
      const extracted = await runClaude(content.slice(0, 50000));
      if (extracted) { pass("Claude extracted:"); printExtraction(extracted); return true; }
      else { fail("Claude parse failed"); }
    }
    return true;
  } catch (err) { fail(`Threw: ${err instanceof Error ? err.message : String(err)}`); return false; }
}

// ── STRATEGY 3: Direct fetch → JSON-LD only ───────────────────────────────
async function testDirectJsonLd(url: string, runExtraction: boolean): Promise<boolean> {
  console.log("\n  ── Strategy 3: Direct fetch → JSON-LD only ─────────────────");
  try {
    const res = await fetch(url, { headers: STEALTH_HEADERS, signal: AbortSignal.timeout(15000) });
    info(`HTTP ${res.status}`);
    if (!res.ok) { fail(`Non-OK`); return false; }
    const html = await res.text();
    info(`Raw HTML: ${html.length} chars`);
    const jsonLdContent = extractJsonLdOnly(html, 200);
    if (!jsonLdContent) {
      fail("No JSON-LD blocks found — would fall through to prepareHtml");
      const fullContent = prepareHtml(html);
      info(`Full prepareHtml: ${fullContent.length} chars`);
      const hit = botSignalHit(fullContent);
      if (fullContent.length > 1000 && !hit) {
        info("Full content looks ok, testing extraction…");
        if (runExtraction) {
          const extracted = await runClaude(fullContent);
          if (extracted) { pass("Claude extracted (full):"); printExtraction(extracted); return true; }
        }
      }
      return false;
    }
    const imageUrls = extractImageUrls(html);
    const content = imageUrls.length > 0
      ? jsonLdContent + "\n\n=== IMAGE URLS ===\n" + imageUrls.join("\n")
      : jsonLdContent;
    const hit = botSignalHit(content);
    info(`JSON-LD blocks: ${(html.match(/application\/ld\+json/gi) ?? []).length} | combined: ${content.length} chars | images: ${imageUrls.length} | bot: ${hit ?? "none"}`);
    info(`JSON-LD preview: ${jsonLdContent.slice(0, 400)}`);
    if (hit) { fail(`Bot signal: ${hit}`); return false; }
    pass("Direct JSON-LD content looks good");
    if (runExtraction) {
      info("Running Claude extraction…");
      const extracted = await runClaude(content.slice(0, 50000));
      if (extracted) { pass("Claude extracted:"); printExtraction(extracted); return true; }
      else { fail("Claude parse failed"); }
    }
    return true;
  } catch (err) { fail(`Threw: ${err instanceof Error ? err.message : String(err)}`); return false; }
}

// ── STRATEGY 4: Google cache → JSON-LD only ───────────────────────────────
async function testGoogleCache(url: string, runExtraction: boolean): Promise<boolean> {
  console.log("\n  ── Strategy 4: Google cache → JSON-LD only ─────────────────");
  try {
    const res = await fetch(
      `https://webcache.googleusercontent.com/search?q=cache:${encodeURIComponent(url)}`,
      { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }, signal: AbortSignal.timeout(15000) },
    );
    info(`HTTP ${res.status}`);
    if (!res.ok) { fail(`Non-OK: ${(await res.text().catch(() => "")).slice(0, 150)}`); return false; }
    const html = await res.text();
    info(`Raw HTML: ${html.length} chars`);
    const jsonLdContent = extractJsonLdOnly(html, 200);
    if (!jsonLdContent) {
      fail("No JSON-LD blocks found — would skip (not send garbage JS bundle)");
      return false;
    }
    const imageUrls = extractImageUrls(html);
    const content = imageUrls.length > 0
      ? jsonLdContent + "\n\n=== IMAGE URLS ===\n" + imageUrls.join("\n")
      : jsonLdContent;
    const hit = botSignalHit(content);
    info(`JSON-LD combined: ${content.length} chars | images: ${imageUrls.length} | bot: ${hit ?? "none"}`);
    if (hit) { fail(`Bot signal: ${hit}`); return false; }
    pass("Google cache JSON-LD content looks good");
    if (runExtraction) {
      info("Running Claude extraction…");
      const extracted = await runClaude(content.slice(0, 50000));
      if (extracted) { pass("Claude extracted:"); printExtraction(extracted); return true; }
      else { fail("Claude parse failed"); }
    }
    return true;
  } catch (err) { fail(`Threw: ${err instanceof Error ? err.message : String(err)}`); return false; }
}

// ── STRATEGY 5: AllOrigins proxy ──────────────────────────────────────────
async function testAllOrigins(url: string): Promise<boolean> {
  console.log("\n  ── Strategy 5: AllOrigins proxy (last resort) ───────────────");
  try {
    const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
    info(`HTTP ${res.status}`);
    if (!res.ok) { fail(`Non-OK`); return false; }
    const data = (await res.json()) as { contents?: string; status?: { http_code?: number } };
    info(`Proxy HTTP code: ${data.status?.http_code ?? "unknown"}`);
    const raw = data.contents ?? "";
    const jsonLdContent = raw.startsWith("<") ? extractJsonLdOnly(raw) : null;
    const content = jsonLdContent ?? (raw.startsWith("<") ? prepareHtml(raw) : raw.slice(0, 50000));
    const hit = botSignalHit(content);
    info(`Raw: ${raw.length} → used: ${jsonLdContent ? "jsonld" : "prepared"} (${content.length} chars) | bot: ${hit ?? "none"}`);
    if (content.length <= 500 || hit) { fail(`Rejected: ${hit ?? "too short"}`); return false; }
    pass("AllOrigins content looks usable");
    return true;
  } catch (err) { fail(`Threw: ${err instanceof Error ? err.message : String(err)}`); return false; }
}

async function testUrl(url: string) {
  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log(`  Testing: ${url}`);
  console.log("╚══════════════════════════════════════════════════════════╝");

  // Strategy 1: Zillow/Trulia fast-fail
  console.log("\n  ── Strategy 1: Zillow/Trulia fast-fail ──────────────────");
  if (url.includes("zillow.com") || url.includes("trulia.com")) {
    pass("Would fast-fail with zillow_blocked message");
    return;
  }
  info("Not Zillow/Trulia — continuing");

  // Test all strategies, run Claude only on the first that succeeds
  const jinaOk = await testJina(url, true);
  const directOk = await testDirectJsonLd(url, !jinaOk);
  const cacheOk = await testGoogleCache(url, !jinaOk && !directOk);
  await testAllOrigins(url);

  console.log("\n  ── Summary ───────────────────────────────────────────────");
  console.log(`  Jina: ${jinaOk ? "✅" : "❌"} | Direct JSON-LD: ${directOk ? "✅" : "❌"} | Google cache: ${cacheOk ? "✅" : "❌"}`);
}

async function main() {
  console.log("=============================================================");
  console.log(" AskHero Import Strategy Test (new order: Jina → Direct JSON-LD → Cache → AllOrigins)");
  console.log("=============================================================");

  for (const url of TEST_URLS) {
    await testUrl(url);
  }

  console.log("\n=============================================================");
  console.log(" Done");
  console.log("=============================================================\n");
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
