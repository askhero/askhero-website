"use client";

import { useState } from "react";
import { Check, Home, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// ── Types ──────────────────────────────────────────────────────────────────

type Step = 1 | 2;

type Fields = {
  streetAddress: string;
  city: string;
  zip: string;
  askingPrice: string;
  bedrooms: string;
  bathrooms: string;
  sqft: string;
  description: string;
};

// ── Constants ──────────────────────────────────────────────────────────────

const FLAT_FEE = "$299";

const CHECKLIST = [
  "Hero Score™ generated automatically",
  "Listing live for 90 days (renewable)",
  "Buyer inquiries sent directly to you",
  "Listing reviewed and approved within 24 hours",
  "No agent required, no commission taken",
  "Edit or update your listing anytime",
];

// ── Shared UI helpers ──────────────────────────────────────────────────────

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-semibold uppercase tracking-wider text-white/50">
      {children}
    </label>
  );
}

function TextInput({
  id,
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  id: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-11 w-full rounded-md border border-white/10 bg-[#0d1117] px-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
    />
  );
}

function FormGroup({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
      {children}
    </div>
  );
}

// ── Step 1 ─────────────────────────────────────────────────────────────────

function Step1({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c9a84c]">Direct Listing</p>
      <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
        List your home directly on AskHero.
      </h1>
      <p className="mt-4 text-lg leading-7 text-white/60">
        Pay a one-time flat fee and your home appears in front of qualified Hero buyers. No agent commission. You control your listing.
      </p>

      {/* Fee card */}
      <div className="mt-8 rounded-2xl border-2 border-[#c9a84c]/50 bg-[#111] p-7 shadow-[0_0_40px_rgba(201,168,76,0.07)]">
        <div className="flex items-baseline gap-3">
          <span className="text-5xl font-extrabold text-[#c9a84c]">{FLAT_FEE}</span>
          <span className="text-base font-medium text-white/50">one-time flat fee</span>
        </div>

        <ul className="mt-6 space-y-3">
          {CHECKLIST.map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm text-white/80">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#c9a84c]" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <Button
        onClick={onContinue}
        className="mt-6 w-full bg-[#c9a84c] text-[#030712] font-bold hover:bg-[#b8963e] sm:w-auto sm:px-10"
      >
        Continue to Listing Details
        <ChevronRight className="ml-1.5 h-4 w-4" />
      </Button>

      <p className="mt-4 text-sm text-white/45">
        Prefer an agent?{" "}
        <Link href="/find-agent" className="text-[#c9a84c] underline-offset-2 hover:underline">
          Find a Hero Agent instead
        </Link>
      </p>
    </div>
  );
}

// ── Step 2 ─────────────────────────────────────────────────────────────────

function Step2({
  fields,
  onChange,
  onContinue,
}: {
  fields: Fields;
  onChange: (key: keyof Fields, value: string) => void;
  onContinue: () => void;
}) {
  const canContinue =
    fields.streetAddress.trim() !== "" &&
    fields.city.trim() !== "" &&
    fields.zip.trim() !== "" &&
    fields.askingPrice.trim() !== "";

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
        Step 1 of 3 — Property Details
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        Tell us about your home.
      </h1>

      <div className="mt-8 space-y-5 rounded-2xl border border-white/10 bg-[#111] p-7">
        {/* Address row */}
        <FormGroup label="Street Address" htmlFor="streetAddress">
          <TextInput
            id="streetAddress"
            placeholder="e.g. 1234 Maple Drive"
            value={fields.streetAddress}
            onChange={(v) => onChange("streetAddress", v)}
          />
        </FormGroup>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormGroup label="City" htmlFor="city">
            <TextInput
              id="city"
              placeholder="e.g. Charlotte"
              value={fields.city}
              onChange={(v) => onChange("city", v)}
            />
          </FormGroup>
          <FormGroup label="ZIP Code" htmlFor="zip">
            <TextInput
              id="zip"
              placeholder="e.g. 28202"
              value={fields.zip}
              onChange={(v) => onChange("zip", v.replace(/\D/g, "").slice(0, 5))}
            />
          </FormGroup>
        </div>

        <FormGroup label="Asking Price" htmlFor="askingPrice">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/40">$</span>
            <input
              id="askingPrice"
              type="text"
              inputMode="numeric"
              placeholder="e.g. 425000"
              value={fields.askingPrice}
              onChange={(e) => onChange("askingPrice", e.target.value.replace(/\D/g, ""))}
              className="h-11 w-full rounded-md border border-white/10 bg-[#0d1117] pl-7 pr-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
            />
          </div>
        </FormGroup>

        <div className="grid gap-5 sm:grid-cols-3">
          <FormGroup label="Bedrooms" htmlFor="bedrooms">
            <TextInput
              id="bedrooms"
              placeholder="e.g. 4"
              value={fields.bedrooms}
              onChange={(v) => onChange("bedrooms", v.replace(/\D/g, ""))}
            />
          </FormGroup>
          <FormGroup label="Bathrooms" htmlFor="bathrooms">
            <TextInput
              id="bathrooms"
              placeholder="e.g. 2.5"
              value={fields.bathrooms}
              onChange={(v) => onChange("bathrooms", v)}
            />
          </FormGroup>
          <FormGroup label="Square Footage" htmlFor="sqft">
            <TextInput
              id="sqft"
              placeholder="e.g. 2200"
              value={fields.sqft}
              onChange={(v) => onChange("sqft", v.replace(/\D/g, ""))}
            />
          </FormGroup>
        </div>

        <FormGroup label="Description / Key Features" htmlFor="description">
          <textarea
            id="description"
            rows={5}
            placeholder="Describe your home — standout features, recent updates, neighborhood highlights…"
            value={fields.description}
            onChange={(e) => onChange("description", e.target.value)}
            className="w-full resize-none rounded-md border border-white/10 bg-[#0d1117] px-3 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
          />
        </FormGroup>
      </div>

      {/* Footer bar */}
      <div className="mt-5 flex items-center justify-between rounded-xl border border-white/8 bg-[#111] px-5 py-3">
        <span className="text-sm text-white/45">Listing fee charged at payment step</span>
        <span className="text-lg font-extrabold text-[#c9a84c]">{FLAT_FEE}</span>
      </div>

      <Button
        onClick={onContinue}
        disabled={!canContinue}
        className="mt-5 w-full bg-[#c9a84c] text-[#030712] font-bold hover:bg-[#b8963e] disabled:opacity-40 sm:w-auto sm:px-10"
      >
        Continue to Photos & Payment
        <ChevronRight className="ml-1.5 h-4 w-4" />
      </Button>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

const EMPTY_FIELDS: Fields = {
  streetAddress: "",
  city: "",
  zip: "",
  askingPrice: "",
  bedrooms: "",
  bathrooms: "",
  sqft: "",
  description: "",
};

export default function SellerCreateListingPage() {
  const [step, setStep] = useState<Step>(1);
  const [fields, setFields] = useState<Fields>(EMPTY_FIELDS);

  function handleFieldChange(key: keyof Fields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Minimal header */}
      <div className="border-b border-white/8 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-3" aria-label="AskHero home">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#c9a84c]/45 bg-[#c9a84c]/12 text-[#c9a84c]">
              <Home className="h-5 w-5" />
            </span>
            <span className="text-lg font-extrabold text-white">AskHero</span>
          </Link>
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="text-sm text-white/45 hover:text-white"
            >
              Back
            </button>
          )}
        </div>
      </div>

      {/* Step progress dots */}
      {step === 2 && (
        <div className="mx-auto flex max-w-2xl items-center gap-2 px-4 pt-6 sm:px-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                n === 1 ? "bg-[#c9a84c]" : "bg-white/12"
              }`}
            />
          ))}
        </div>
      )}

      <div className="px-4 py-12 sm:px-6 lg:py-16">
        {step === 1 ? (
          <Step1 onContinue={() => setStep(2)} />
        ) : (
          <Step2
            fields={fields}
            onChange={handleFieldChange}
            onContinue={() => {
              // Photos & Payment step — placeholder for future implementation
              alert("Photos & Payment step coming soon.");
            }}
          />
        )}
      </div>
    </div>
  );
}
