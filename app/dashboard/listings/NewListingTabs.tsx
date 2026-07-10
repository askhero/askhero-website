"use client";

import { useState } from "react";
import { ImportListingForm } from "@/app/dashboard/listings/ImportListingForm";
import { HeroListingBuilder } from "@/components/hero/listing-builder/HeroListingBuilder";

type Tab = "import" | "manual";

export function NewListingTabs() {
  const [tab, setTab] = useState<Tab>("import");

  return (
    <div>
      {/* Tab bar */}
      <div className="mb-8 flex border-b border-white/10">
        <TabButton active={tab === "import"} onClick={() => setTab("import")}>
          Import from URL
        </TabButton>
        <TabButton active={tab === "manual"} onClick={() => setTab("manual")}>
          Enter Manually
        </TabButton>
      </div>

      {tab === "import" ? (
        <div className="max-w-2xl">
          <ImportListingForm />
        </div>
      ) : (
        <HeroListingBuilder />
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-6 py-3 text-sm font-semibold transition ${
        active
          ? "border-b-2 border-[#c9a84c] text-white"
          : "border-b-2 border-transparent text-white/42 hover:text-white/70"
      }`}
    >
      {children}
    </button>
  );
}
