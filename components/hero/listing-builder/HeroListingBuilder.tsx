"use client";

import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroConfirmListingButton } from "@/components/hero/listing-builder/HeroConfirmListingButton";
import { HeroListingEditableFields } from "@/components/hero/listing-builder/HeroListingEditableFields";
import { HeroListingPreview } from "@/components/hero/listing-builder/HeroListingPreview";
import { HeroListingTextInput } from "@/components/hero/listing-builder/HeroListingTextInput";
import { HeroMediaUploader } from "@/components/hero/listing-builder/HeroMediaUploader";
import type { BuilderMediaFile, EditableListingFields, ListingBuilderDraft } from "@/components/hero/listing-builder/types";

const starterPrompt = "I want to list 9545 Valencia Avenue NW, Concord, NC 28027 for $350,000. It has 4 bedrooms, 3 bathrooms, about 2,600 sqft, a fenced backyard, updated kitchen, two-car garage, and I have photos and a video.";

export function HeroListingBuilder() {
  const [prompt, setPrompt] = useState("");
  const [media, setMedia] = useState<BuilderMediaFile[]>([]);
  const [draft, setDraft] = useState<ListingBuilderDraft | null>(null);
  const [fields, setFields] = useState<EditableListingFields | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const hasMediaCategories = useMemo(() => media.every((item) => item.category || item.tourLabel), [media]);
  const canSubmit = useMemo(() => prompt.trim().length >= 20 && hasMediaCategories && status !== "loading", [hasMediaCategories, prompt, status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const formData = new FormData();
    formData.append("prompt", prompt);
    media.forEach((item) => {
      formData.append("media", item.file);
      formData.append("mediaLabels", item.tourLabel || item.category || "");
      formData.append("mediaCategories", item.category || item.tourLabel || "");
      formData.append("mediaCategorySlugs", item.categorySlug || "");
      formData.append("mediaOrders", String(item.tourOrder ?? ""));
      formData.append("mediaIsCover", item.isCover ? "true" : "false");
    });

    try {
      const response = await fetch("/api/listings/builder", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as ListingBuilderDraft & { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Unable to build listing draft.");
      }

      setDraft(data);
      setFields({
        ...data.draft.parsed,
        title: data.draft.title,
        description: data.draft.description,
        heroAiSummary: data.draft.heroAiSummary,
        highlightsText: data.draft.highlights.join("\n"),
        missingDataText: data.draft.missingData.join("\n"),
      });
      setStatus("success");
      setMessage("Please review everything Hero created. If anything is incorrect, edit it before confirming.");
    } catch (caught) {
      setStatus("error");
      setMessage(caught instanceof Error ? caught.message : "Unable to build listing draft.");
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[0.82fr_1.18fr] xl:items-start">
      <div className="space-y-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          <HeroListingTextInput value={prompt} onChange={setPrompt} />
          <HeroMediaUploader media={media} onChange={setMedia} />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="submit" size="lg" disabled={!canSubmit} className="rounded-2xl px-7 font-bold">
              {status === "loading" ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
              {status === "loading" ? "Building Listing..." : "Build Hero Listing"}
            </Button>
            <button type="button" className="text-left text-sm font-semibold text-white/56 transition hover:text-white" onClick={() => setPrompt(starterPrompt)}>
              Use example prompt
            </button>
          </div>
          {!hasMediaCategories ? <p className="text-sm text-red-300">Choose a media category for every uploaded file before building.</p> : null}
          {message && <p className={`text-sm ${status === "error" ? "text-red-300" : "text-gold-200"}`}>{message}</p>}
        </form>

        {fields && draft && (
          <HeroListingEditableFields fields={fields} onChange={setFields} />
        )}
      </div>

      <div className="space-y-5 xl:sticky xl:top-24">
        {fields && draft ? (
          <>
            <HeroListingPreview fields={fields} localMedia={media} savedMedia={draft.media} heroScore={draft.draft.heroScore.total_score} providerData={draft.draft.providerData} enrichment={draft.draft.enrichment} />
            <div className="rounded-2xl border border-gold-300/20 bg-gold-400/8 p-5">
              <p className="text-sm leading-6 text-white/70">Please review everything Hero created. If anything is incorrect, edit it before confirming.</p>
              <div className="mt-4">
                <HeroConfirmListingButton listingId={draft.listingId} fields={fields} onConfirmed={(nextMessage) => setMessage(nextMessage)} />
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center shadow-[0_30px_120px_rgba(0,0,0,0.38)] backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.18em] text-gold-200/80">Live preview</p>
            <h2 className="mt-3 text-2xl font-bold text-white">Your Hero listing draft will appear here.</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/54">Hero will extract facts, create a title and description, identify missing data, and save the draft to Supabase before confirmation.</p>
          </div>
        )}
      </div>
    </div>
  );
}
