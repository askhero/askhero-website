"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Globe, ImageIcon, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ImportedListing } from "@/app/api/listings/import/route";

type Phase = "idle" | "loading" | "fallback" | "fallback-loading" | "review" | "submitting";

const LOADING_MESSAGES = [
  "Connecting to listing site...",
  "Reading property details...",
  "Extracting price and features...",
  "Importing listing data...",
  "Parsing agent information...",
  "Almost done...",
];

type FormData = {
  address_line_1: string;
  city: string;
  state: string;
  zip: string;
  price: string;
  beds: string;
  baths: string;
  sqft: string;
  year_built: string;
  lot_size: string;
  property_type: string;
  description: string;
  listing_agent_name: string;
  listing_agent_phone: string;
  listing_agent_email: string;
  brokerage_name: string;
  hoa_fee: string;
  features: string;
};

function listingToForm(listing: ImportedListing): FormData {
  return {
    address_line_1: listing.address_line_1 ?? "",
    city: listing.city ?? "",
    state: listing.state ?? "",
    zip: listing.zip ?? "",
    price: listing.price !== null ? String(listing.price) : "",
    beds: listing.beds !== null ? String(listing.beds) : "",
    baths: listing.baths !== null ? String(listing.baths) : "",
    sqft: listing.sqft !== null ? String(listing.sqft) : "",
    year_built: listing.year_built !== null ? String(listing.year_built) : "",
    lot_size: listing.lot_size !== null ? String(listing.lot_size) : "",
    property_type: listing.property_type ?? "",
    description: listing.description ?? "",
    listing_agent_name: listing.listing_agent_name ?? "",
    listing_agent_phone: listing.listing_agent_phone ?? "",
    listing_agent_email: listing.listing_agent_email ?? "",
    brokerage_name: listing.brokerage_name ?? "",
    hoa_fee: listing.hoa_fee !== null ? String(listing.hoa_fee) : "",
    features: listing.features.join(", "),
  };
}

export function ImportListingForm() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [url, setUrl] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [fallbackMessage, setFallbackMessage] = useState("");
  const [formData, setFormData] = useState<FormData | null>(null);
  const [rawListing, setRawListing] = useState<ImportedListing | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [originalUrl, setOriginalUrl] = useState("");
  const [certified, setCertified] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messageRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startLoadingAnimations() {
    setProgress(0);
    setMessageIndex(0);
    const start = Date.now();
    const duration = 15000;
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(95, (elapsed / duration) * 100);
      setProgress(pct);
      if (elapsed >= duration && progressRef.current) clearInterval(progressRef.current);
    }, 100);
    messageRef.current = setInterval(() => {
      setMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2500);
  }

  function stopLoadingAnimations() {
    if (progressRef.current) clearInterval(progressRef.current);
    if (messageRef.current) clearInterval(messageRef.current);
  }

  useEffect(() => () => stopLoadingAnimations(), []);

  async function runImport(payload: { url?: string; pastedText?: string }, isFallback: boolean) {
    const controller = new AbortController();
    abortRef.current = controller;
    const phaseToSet: Phase = isFallback ? "fallback-loading" : "loading";
    setPhase(phaseToSet);
    if (!isFallback) startLoadingAnimations();
    setSubmitError("");

    try {
      const res = await fetch("/api/listings/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const data = (await res.json()) as {
        success?: boolean;
        fallback?: boolean;
        reason?: string;
        message?: string;
        listing?: ImportedListing;
        strategy?: string;
        error?: string;
      };

      stopLoadingAnimations();
      setProgress(100);

      if (data.success && data.listing) {
        setRawListing(data.listing);
        setFormData(listingToForm(data.listing));
        setSelectedImages(data.listing.images ?? []);
        setPhase("review");
      } else if (data.fallback) {
        setFallbackMessage(data.message ?? "Couldn't fetch the listing automatically.");
        setPhase("fallback");
      } else {
        setSubmitError(data.error ?? "Something went wrong. Please try again.");
        setPhase(isFallback ? "fallback" : "idle");
      }
    } catch (err) {
      stopLoadingAnimations();
      if (err instanceof DOMException && err.name === "AbortError") {
        setPhase("idle");
        return;
      }
      setSubmitError("Request failed. Please try again.");
      setPhase(isFallback ? "fallback" : "idle");
    }
  }

  function handleImport() {
    if (!url.trim()) return;
    setOriginalUrl(url.trim());
    void runImport({ url: url.trim() }, false);
  }

  function handleExtractPaste() {
    if (!pastedText.trim()) return;
    void runImport({ pastedText: pastedText.trim() }, true);
  }

  function handleCancel() {
    abortRef.current?.abort();
    stopLoadingAnimations();
    setPhase("idle");
  }

  function updateForm(key: keyof FormData, value: string) {
    setFormData((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function removeImage(imgUrl: string) {
    setSelectedImages((prev) => prev.filter((u) => u !== imgUrl));
  }

  async function handleSubmit() {
    if (!formData) return;
    setPhase("submitting");
    setSubmitError("");

    const res = await fetch("/api/listings/import-submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        price: formData.price ? Number(formData.price) : null,
        beds: formData.beds ? Number(formData.beds) : null,
        baths: formData.baths ? Number(formData.baths) : null,
        sqft: formData.sqft ? Number(formData.sqft) : null,
        year_built: formData.year_built ? Number(formData.year_built) : null,
        lot_size: formData.lot_size ? Number(formData.lot_size) : null,
        hoa_fee: formData.hoa_fee ? Number(formData.hoa_fee) : null,
        features: formData.features.split(",").map((s) => s.trim()).filter(Boolean),
        import_source_url: originalUrl,
        imported_image_urls: selectedImages,
        certification_accepted: true,
        certification_timestamp: new Date().toISOString(),
      }),
    }).catch(() => null);

    if (!res || !res.ok) {
      const body = res ? ((await res.json().catch(() => ({}))) as { error?: string }) : {};
      setSubmitError(body.error ?? "Unable to submit listing. Please try again.");
      setPhase("review");
      return;
    }

    router.push("/dashboard/listings?message=listing-submitted");
  }

  const canSubmit =
    certified &&
    !!formData?.address_line_1.trim() &&
    !!formData?.price.trim() &&
    !!formData?.beds.trim() &&
    !!formData?.baths.trim();

  // ── LOADING ──────────────────────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-white/70">{LOADING_MESSAGES[messageIndex]}</span>
            <span className="text-white/40">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[#c9a84c] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <p className="text-xs text-white/38">Trying multiple fetch strategies to read the listing…</p>
        <button
          onClick={handleCancel}
          className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white/60 transition hover:border-white/25 hover:text-white/80"
        >
          Cancel
        </button>
      </div>
    );
  }

  // ── FALLBACK ─────────────────────────────────────────────────────────────
  if (phase === "fallback" || phase === "fallback-loading") {
    return (
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <p className="text-sm leading-6 text-amber-200">{fallbackMessage}</p>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-white/70">Paste listing details here</Label>
          <Textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Copy and paste anything from the listing — title, price, address, description, features, agent info. The more you paste, the better we can extract."
            className="min-h-[200px] resize-y border-white/15 bg-white/[0.06] text-white placeholder:text-white/28 focus:border-[#c9a84c]/50"
            disabled={phase === "fallback-loading"}
          />
        </div>

        {phase === "fallback-loading" ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Loader2 className="h-4 w-4 animate-spin text-[#c9a84c]" />
              Extracting listing details…
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={handleExtractPaste}
              disabled={!pastedText.trim()}
              className="bg-[#c9a84c] font-bold text-black hover:bg-[#b8973b] disabled:opacity-50"
            >
              Extract Details
            </Button>
            <button
              onClick={() => { setPhase("idle"); setFallbackMessage(""); }}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white/60 transition hover:text-white/80"
            >
              Try a different URL
            </button>
          </div>
        )}

        {submitError && <p className="text-sm text-red-400">{submitError}</p>}
      </div>
    );
  }

  // ── REVIEW ────────────────────────────────────────────────────────────────
  if ((phase === "review" || phase === "submitting") && formData) {
    return (
      <div className="space-y-7">
        {/* Success banner */}
        <div className="flex items-start gap-3 rounded-xl border border-green-400/25 bg-green-400/10 px-4 py-3">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
          <p className="text-sm leading-6 text-green-200">
            Listing imported successfully — review and edit all details before submitting.
          </p>
        </div>

        {/* Extraction summary */}
        {rawListing && <ExtractionSummary listing={rawListing} />}

        {/* Group 1 — Address */}
        <fieldset className="space-y-4">
          <legend className="text-xs font-bold uppercase tracking-widest text-white/38">Property Address</legend>
          <div className="mt-3">
            <Label className="mb-1.5 block text-xs text-white/58">Address Line 1</Label>
            <Input
              value={formData.address_line_1}
              onChange={(e) => updateForm("address_line_1", e.target.value)}
              className="border-white/15 bg-white/[0.06] text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <Label className="mb-1.5 block text-xs text-white/58">City</Label>
              <Input
                value={formData.city}
                onChange={(e) => updateForm("city", e.target.value)}
                className="border-white/15 bg-white/[0.06] text-white"
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-white/58">State</Label>
              <Input
                value={formData.state}
                maxLength={2}
                onChange={(e) => updateForm("state", e.target.value.toUpperCase())}
                className="border-white/15 bg-white/[0.06] text-white"
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-white/58">ZIP</Label>
              <Input
                value={formData.zip}
                onChange={(e) => updateForm("zip", e.target.value)}
                className="border-white/15 bg-white/[0.06] text-white"
              />
            </div>
          </div>
        </fieldset>

        {/* Group 2 — Key Details */}
        <fieldset className="space-y-3">
          <legend className="text-xs font-bold uppercase tracking-widest text-white/38">Key Details</legend>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block text-xs text-white/58">Price ($)</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => updateForm("price", e.target.value)}
                className="border-white/15 bg-white/[0.06] text-white"
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-white/58">Beds</Label>
              <Input
                type="number"
                value={formData.beds}
                onChange={(e) => updateForm("beds", e.target.value)}
                className="border-white/15 bg-white/[0.06] text-white"
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-white/58">Baths</Label>
              <Input
                type="number"
                value={formData.baths}
                onChange={(e) => updateForm("baths", e.target.value)}
                className="border-white/15 bg-white/[0.06] text-white"
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-white/58">Sqft</Label>
              <Input
                type="number"
                value={formData.sqft}
                onChange={(e) => updateForm("sqft", e.target.value)}
                className="border-white/15 bg-white/[0.06] text-white"
              />
            </div>
          </div>
        </fieldset>

        {/* Group 3 — Additional Details */}
        <fieldset className="space-y-3">
          <legend className="text-xs font-bold uppercase tracking-widest text-white/38">Additional Details</legend>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block text-xs text-white/58">Year Built</Label>
              <Input
                type="number"
                value={formData.year_built}
                onChange={(e) => updateForm("year_built", e.target.value)}
                className="border-white/15 bg-white/[0.06] text-white"
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-white/58">Property Type</Label>
              <select
                value={formData.property_type}
                onChange={(e) => updateForm("property_type", e.target.value)}
                className="h-10 w-full rounded-md border border-white/15 bg-[#111827] px-3 text-sm text-white focus:border-[#c9a84c]/50 focus:outline-none"
              >
                <option value="">Select type…</option>
                <option value="Single Family">Single Family</option>
                <option value="Condo">Condo</option>
                <option value="Townhouse">Townhouse</option>
                <option value="Multi-Family">Multi-Family</option>
                <option value="Land">Land</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-white/58">Lot Size (acres)</Label>
              <Input
                type="number"
                value={formData.lot_size}
                onChange={(e) => updateForm("lot_size", e.target.value)}
                className="border-white/15 bg-white/[0.06] text-white"
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-white/58">HOA Fee ($/month)</Label>
              <Input
                type="number"
                value={formData.hoa_fee}
                onChange={(e) => updateForm("hoa_fee", e.target.value)}
                className="border-white/15 bg-white/[0.06] text-white"
              />
            </div>
          </div>
        </fieldset>

        {/* Group 4 — Description */}
        <fieldset>
          <legend className="mb-3 text-xs font-bold uppercase tracking-widest text-white/38">Description</legend>
          <Textarea
            value={formData.description}
            onChange={(e) => updateForm("description", e.target.value)}
            className="min-h-[120px] border-white/15 bg-white/[0.06] text-white"
          />
        </fieldset>

        {/* Group 5 — Features */}
        <fieldset>
          <legend className="mb-1.5 text-xs font-bold uppercase tracking-widest text-white/38">Features</legend>
          <p className="mb-3 text-xs text-white/38">Comma-separated list of key features</p>
          <Input
            value={formData.features}
            onChange={(e) => updateForm("features", e.target.value)}
            className="border-white/15 bg-white/[0.06] text-white"
            placeholder="Open floor plan, Updated kitchen, Two-car garage…"
          />
        </fieldset>

        {/* Group 6 — Agent Info */}
        <fieldset className="space-y-3">
          <legend className="text-xs font-bold uppercase tracking-widest text-white/38">Agent Information</legend>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block text-xs text-white/58">Agent Name</Label>
              <Input
                value={formData.listing_agent_name}
                onChange={(e) => updateForm("listing_agent_name", e.target.value)}
                className="border-white/15 bg-white/[0.06] text-white"
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-white/58">Agent Phone</Label>
              <Input
                value={formData.listing_agent_phone}
                onChange={(e) => updateForm("listing_agent_phone", e.target.value)}
                className="border-white/15 bg-white/[0.06] text-white"
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-white/58">Agent Email</Label>
              <Input
                type="email"
                value={formData.listing_agent_email}
                onChange={(e) => updateForm("listing_agent_email", e.target.value)}
                className="border-white/15 bg-white/[0.06] text-white"
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-white/58">Brokerage</Label>
              <Input
                value={formData.brokerage_name}
                onChange={(e) => updateForm("brokerage_name", e.target.value)}
                className="border-white/15 bg-white/[0.06] text-white"
              />
            </div>
          </div>
        </fieldset>

        {/* Group 7 — Images */}
        <fieldset>
          <legend className="mb-3 text-xs font-bold uppercase tracking-widest text-white/38">
            Imported Images{selectedImages.length > 0 ? ` — ${selectedImages.length} selected` : ""}
          </legend>
          {selectedImages.length > 0 ? (
            <>
              <div className="grid grid-cols-3 gap-2">
                {selectedImages.map((imgUrl) => (
                  <div key={imgUrl} className="group relative overflow-hidden rounded-xl border border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgUrl}
                      alt="Imported listing photo"
                      className="h-24 w-full object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(imgUrl)}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition group-hover:opacity-100"
                      aria-label="Remove image"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-white/38">Images will be reviewed during approval. Click × to remove.</p>
            </>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-4 text-sm text-white/40">
              <ImageIcon className="h-5 w-5" />
              No images were found — you can add images after submission.
            </div>
          )}
        </fieldset>

        {/* Divider + Certification */}
        <div className="border-t border-white/10 pt-6">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={certified}
              onChange={(e) => setCertified(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#c9a84c]"
            />
            <span className="text-sm leading-6 text-white/64">
              I certify that I am the listing agent or an authorized representative for this property, that I have the
              right to list it on AskHero, and that all information I have provided is accurate to the best of my
              knowledge. I understand that submitting false information may result in removal from AskHero.
            </span>
          </label>

          {submitError && (
            <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {submitError}
            </p>
          )}

          <Button
            onClick={() => void handleSubmit()}
            disabled={!canSubmit || phase === "submitting"}
            className={`mt-5 w-full font-bold transition sm:w-auto ${
              canSubmit
                ? "bg-[#c9a84c] text-black hover:bg-[#b8973b]"
                : "cursor-not-allowed bg-white/10 text-white/30"
            }`}
          >
            {phase === "submitting" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting…
              </>
            ) : (
              "Submit Listing for Review"
            )}
          </Button>
        </div>
      </div>
    );
  }

  // ── IDLE ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">Import from Any Listing Website</h2>
        <p className="mt-2 text-sm leading-6 text-white/54">
          Paste any URL from your agency website, Redfin, Homes.com, Realtor.com, MLS, or any real estate site.
          We&apos;ll fetch all the details automatically.
        </p>
      </div>

      <div className="relative">
        <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
        <Input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleImport(); }}
          placeholder="https://youragency.com/listings/123-main-st"
          className="border-white/15 bg-white/[0.06] pl-9 text-white placeholder:text-white/28 focus:border-[#c9a84c]/50"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {["Redfin", "Realtor.com", "Homes.com", "MLS", "Your Agency Site", "Any URL"].map((site) => (
          <span
            key={site}
            className="rounded-full border border-white/12 bg-white/[0.05] px-2.5 py-0.5 text-xs text-white/46"
          >
            {site}
          </span>
        ))}
      </div>

      {submitError && <p className="text-sm text-red-400">{submitError}</p>}

      <Button
        onClick={handleImport}
        disabled={!url.trim()}
        className="w-full bg-[#c9a84c] font-bold text-black hover:bg-[#b8973b] disabled:opacity-50"
      >
        Import Listing
      </Button>
    </div>
  );
}

// ── EXTRACTION SUMMARY ────────────────────────────────────────────────────────

type SummaryField = { label: string; key: keyof ImportedListing };

const SUMMARY_FIELDS: SummaryField[] = [
  { label: "address", key: "address_line_1" },
  { label: "price", key: "price" },
  { label: "beds", key: "beds" },
  { label: "baths", key: "baths" },
  { label: "sqft", key: "sqft" },
  { label: "year built", key: "year_built" },
  { label: "property type", key: "property_type" },
  { label: "description", key: "description" },
  { label: "agent info", key: "listing_agent_name" },
  { label: "features", key: "features" },
  { label: "images", key: "images" },
];

function isPresent(value: ImportedListing[keyof ImportedListing]): boolean {
  if (value === null || value === undefined) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
}

function ExtractionSummary({ listing }: { listing: ImportedListing }) {
  const found = SUMMARY_FIELDS.filter((f) => isPresent(listing[f.key]));
  const missing = SUMMARY_FIELDS.filter((f) => !isPresent(listing[f.key]));

  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-xs">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {found.length > 0 && (
          <span className="text-white/38">
            <span className="font-semibold text-green-400">Extracted:</span>{" "}
            {found.map((f) => f.label).join(" · ")}
          </span>
        )}
        {missing.length > 0 && (
          <span className="text-white/38">
            <span className="font-semibold text-amber-400">Not found:</span>{" "}
            {missing.map((f) => f.label).join(" · ")}
          </span>
        )}
      </div>
    </div>
  );
}
