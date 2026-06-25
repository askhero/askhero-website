"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EditableListingFields } from "@/components/hero/listing-builder/types";

export function HeroConfirmListingButton({ listingId, fields, onConfirmed }: { listingId: string; fields: EditableListingFields; onConfirmed: (message: string) => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function confirmListing() {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/listings/${listingId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          fields: {
            ...fields,
            highlights: fields.highlightsText.split("\n").map((item) => item.trim()).filter(Boolean),
            missingData: fields.missingDataText.split("\n").map((item) => item.trim()).filter(Boolean),
          },
        }),
      });
      const data = (await response.json()) as { error?: string; status?: string; published?: boolean };
      if (!response.ok) {
        throw new Error(data.error || "Unable to confirm listing.");
      }
      onConfirmed(data.published ? "Hero Listing confirmed and published." : "Hero Listing confirmed and sent for review.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to confirm listing.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <Button type="button" size="lg" onClick={() => void confirmListing()} disabled={isLoading} className="w-full rounded-2xl font-bold sm:w-auto">
        <CheckCircle2 className="h-5 w-5" />
        {isLoading ? "Confirming..." : "Confirm Hero Listing"}
      </Button>
      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
    </div>
  );
}