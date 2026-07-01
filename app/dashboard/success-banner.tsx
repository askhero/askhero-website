"use client";

import { useState } from "react";
import { CheckCircle2, X } from "lucide-react";

const MESSAGES: Record<string, string> = {
  "password-updated": "Password updated successfully.",
};

export function SuccessBanner({ messageKey }: { messageKey: string }) {
  const [dismissed, setDismissed] = useState(false);
  const text = MESSAGES[messageKey];

  if (!text || dismissed) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 rounded-lg border border-green-400/25 bg-green-400/8 px-4 py-3">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-green-400" />
        <p className="flex-1 text-sm text-green-100">{text}</p>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="text-white/40 transition hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
