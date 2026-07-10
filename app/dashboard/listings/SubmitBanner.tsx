"use client";

import { useState } from "react";
import { CheckCircle2, X } from "lucide-react";

export function SubmitBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-green-400/25 bg-green-400/10 px-4 py-3">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
        <p className="text-sm leading-6 text-green-200">
          Your listing has been submitted for review. We&apos;ll notify you once it&apos;s approved — usually within 24
          hours.
        </p>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="mt-0.5 shrink-0 text-green-400/60 transition hover:text-green-400"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
