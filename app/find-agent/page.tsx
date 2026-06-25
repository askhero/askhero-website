"use client";

import { useState } from "react";
import { BadgeCheck, Star, Phone, Mail, Home, Building2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// ── Types ──────────────────────────────────────────────────────────────────

type Agent = {
  id: number;
  name: string;
  city: string;
  zip: string;
  rating: number;
  reviews: number;
  listings: number;
  specialties: string[];
  phone: string;
  bio: string;
  coverCities: string[];
};

// ── Mock data ──────────────────────────────────────────────────────────────

const AGENTS: Agent[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    city: "Charlotte",
    zip: "28202",
    rating: 4.9,
    reviews: 142,
    listings: 18,
    specialties: ["First-Time Buyers", "Luxury Homes"],
    phone: "(704) 555-0101",
    bio: "Top-rated Hero Agent serving Charlotte and surrounding areas for 12 years.",
    coverCities: ["Charlotte", "Mecklenburg County", "Ballantyne", "Pineville"],
  },
  {
    id: 2,
    name: "Marcus Williams",
    city: "Huntersville",
    zip: "28078",
    rating: 4.8,
    reviews: 98,
    listings: 12,
    specialties: ["Relocations", "New Construction"],
    phone: "(704) 555-0202",
    bio: "Expert in North Charlotte suburbs including Huntersville, Cornelius, and Davidson.",
    coverCities: ["Huntersville", "Cornelius", "Davidson", "Mooresville", "Mecklenburg County"],
  },
  {
    id: 3,
    name: "Priya Patel",
    city: "Matthews",
    zip: "28105",
    rating: 4.9,
    reviews: 76,
    listings: 9,
    specialties: ["Investment Properties", "Downsizing"],
    phone: "(704) 555-0303",
    bio: "Southeast Charlotte specialist covering Matthews, Mint Hill, and Indian Trail.",
    coverCities: ["Matthews", "Mint Hill", "Indian Trail", "Stallings", "Harrisburg", "Mecklenburg County"],
  },
  {
    id: 4,
    name: "Derek Thompson",
    city: "Concord",
    zip: "28025",
    rating: 4.7,
    reviews: 115,
    listings: 22,
    specialties: ["Families", "School District Guidance"],
    phone: "(704) 555-0404",
    bio: "Cabarrus County expert with deep knowledge of school districts and family-friendly neighborhoods.",
    coverCities: ["Concord", "Kannapolis", "Harrisburg", "Cabarrus County"],
  },
  {
    id: 5,
    name: "Alicia Moore",
    city: "Waxhaw",
    zip: "28173",
    rating: 4.8,
    reviews: 63,
    listings: 7,
    specialties: ["Luxury Homes", "Acreage & Land"],
    phone: "(704) 555-0505",
    bio: "Union County specialist serving Waxhaw, Weddington, and Marvin.",
    coverCities: ["Waxhaw", "Weddington", "Marvin", "Monroe", "Indian Trail", "Union County"],
  },
];

const CITIES = [
  "Charlotte",
  "Concord",
  "Huntersville",
  "Matthews",
  "Mint Hill",
  "Pineville",
  "Ballantyne",
  "Cornelius",
  "Davidson",
  "Mooresville",
  "Kannapolis",
  "Gastonia",
  "Belmont",
  "Indian Trail",
  "Monroe",
  "Waxhaw",
  "Weddington",
  "Marvin",
  "Stallings",
  "Harrisburg",
  "Cabarrus County",
  "Union County",
  "Mecklenburg County",
];

const INFO_CARDS = [
  {
    Icon: BadgeCheck,
    title: "Hero Certified",
    text: "Every agent is trained on Hero Score, buyer intent signals, and AskHero data tools before they can list.",
  },
  {
    Icon: Home,
    title: "Charlotte Specialists",
    text: "Our agent network covers the full Charlotte metro — from Uptown to Cabarrus, Union, and Iredell counties.",
  },
  {
    Icon: ShieldCheck,
    title: "Verified Reviews",
    text: "All ratings are verified from closed transactions on the AskHero platform — no anonymous submissions.",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function filterAgents(city: string, zip: string): Agent[] {
  const trimmedZip = zip.trim();
  const trimmedCity = city.trim();

  if (!trimmedCity && !trimmedZip) return [];

  let results = AGENTS;

  if (trimmedCity) {
    const matched = AGENTS.filter((a) =>
      a.coverCities.some((c) => c.toLowerCase() === trimmedCity.toLowerCase())
    );
    if (matched.length > 0) results = matched;
  }

  if (trimmedZip) {
    const zipMatched = results.filter((a) => a.zip === trimmedZip);
    if (zipMatched.length > 0) results = zipMatched;
  }

  return results;
}

// ── Sub-components ─────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-1 text-sm font-semibold text-[#c9a84c]">
      <Star className="h-4 w-4 fill-[#c9a84c] text-[#c9a84c]" />
      {rating.toFixed(1)}
    </span>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  const emailHandle = agent.name.toLowerCase().replace(" ", ".") + "@askhero.com";
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111] p-6">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#c9a84c]/15 text-lg font-extrabold text-[#c9a84c]">
          {initials(agent.name)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-white">{agent.name}</h3>
            <span className="flex items-center gap-1 rounded-full border border-[#c9a84c]/40 bg-[#c9a84c]/10 px-2.5 py-0.5 text-xs font-bold text-[#c9a84c]">
              <BadgeCheck className="h-3 w-3" />
              Hero Certified
            </span>
          </div>
          <p className="mt-0.5 text-sm text-white/52">
            {agent.city}, NC {agent.zip}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-white/8 pt-4 text-sm">
        <StarRating rating={agent.rating} />
        <span className="text-white/52">{agent.reviews} reviews</span>
        <span className="flex items-center gap-1 text-white/52">
          <Building2 className="h-4 w-4" />
          {agent.listings} active listings
        </span>
      </div>

      {/* Specialties */}
      <div className="mt-3 flex flex-wrap gap-2">
        {agent.specialties.map((s) => (
          <span
            key={s}
            className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-medium text-white/70"
          >
            {s}
          </span>
        ))}
      </div>

      {/* Bio */}
      <p className="mt-3 text-sm leading-6 text-white/60">{agent.bio}</p>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-3">
        <Button asChild size="sm" className="bg-[#c9a84c] text-[#030712] font-bold hover:bg-[#b8963e]">
          <a href={`tel:${agent.phone.replace(/\D/g, "")}`}>
            <Phone className="mr-1.5 h-4 w-4" />
            Call Agent
          </a>
        </Button>
        <Button asChild size="sm" variant="secondary">
          <a href={`mailto:${emailHandle}`}>
            <Mail className="mr-1.5 h-4 w-4" />
            Email Agent
          </a>
        </Button>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function FindAgentPage() {
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [results, setResults] = useState<Agent[] | null>(null);

  function handleSearch() {
    setResults(filterAgents(city, zip));
  }

  const canSearch = city.trim() !== "" || zip.trim() !== "";
  const hasSearched = results !== null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="border-b border-white/8 bg-navy-900/86 px-4 py-4 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-3" aria-label="AskHero home">
            <span className="flex h-10 w-10 items-center justify-center rounded-md border border-[#c9a84c]/45 bg-[#c9a84c]/12 text-[#c9a84c]">
              <Home className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold">AskHero</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-white/68 lg:flex">
            {[["Search", "/search"], ["Hero Score", "/hero-score"], ["For Realtors", "/for-realtors"], ["For Sellers", "/for-sellers"], ["Find an Agent", "/find-agent"]].map(([label, href]) => (
              <Link key={href} href={href} className="transition hover:text-white">
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        {/* Hero text */}
        <div className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c9a84c]">Find an Agent</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Work with an agent who knows the data.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/60">
            Hero agents use verified property intelligence — school ratings, crime signals, flood risk, and market outlook — to help you buy or sell with confidence.
          </p>
        </div>

        {/* Search panel */}
        <div className="mb-10 rounded-2xl border border-white/10 bg-[#111] p-6 sm:p-8">
          <div className="grid gap-5 sm:grid-cols-3">
            {/* City */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/50">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="h-11 w-full appearance-none rounded-md border border-white/10 bg-[#0d1117] px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
              >
                <option value="">Select a city…</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* State (read-only) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/50">State</label>
              <input
                type="text"
                value="North Carolina"
                readOnly
                className="h-11 w-full rounded-md border border-white/10 bg-[#0d1117]/60 px-3 text-sm text-white/40 cursor-not-allowed"
              />
            </div>

            {/* ZIP */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/50">ZIP Code (optional)</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={5}
                placeholder="e.g. 28202"
                value={zip}
                onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                className="h-11 w-full rounded-md border border-white/10 bg-[#0d1117] px-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
              />
            </div>
          </div>

          <div className="mt-6">
            <Button
              onClick={handleSearch}
              disabled={!canSearch}
              className="w-full bg-[#c9a84c] text-[#030712] font-bold hover:bg-[#b8963e] disabled:opacity-40 sm:w-auto sm:px-10"
            >
              Search Hero Agents
            </Button>
          </div>
        </div>

        {/* Pre-search info cards */}
        {!hasSearched && (
          <div className="mb-12 grid gap-4 sm:grid-cols-3">
            {INFO_CARDS.map(({ Icon, title, text }) => (
              <div key={title} className="rounded-xl border border-white/10 bg-[#111] p-5">
                <Icon className="h-6 w-6 text-[#c9a84c]" />
                <h3 className="mt-3 text-sm font-bold text-white">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-white/55">{text}</p>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {hasSearched && (
          <div className="mb-12">
            {results!.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#111] p-8 text-center">
                <p className="text-white/60">No agents found for that search. Try a different city or ZIP code.</p>
              </div>
            ) : (
              <>
                <p className="mb-4 text-sm text-white/50">
                  {results!.length} Hero Agent{results!.length !== 1 ? "s" : ""} found
                </p>
                <div className="space-y-4">
                  {results!.map((agent) => (
                    <AgentCard key={agent.id} agent={agent} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Realtor CTA */}
        <div className="rounded-2xl border border-[#c9a84c]/25 bg-[#c9a84c]/6 p-7 sm:flex sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Are you a realtor?</h2>
            <p className="mt-1 text-sm text-white/60">
              Join AskHero as a certified Hero Agent and connect with informed, pre-qualified buyers in your market.
            </p>
          </div>
          <div className="mt-4 sm:ml-8 sm:mt-0 sm:shrink-0">
            <Button asChild className="bg-[#c9a84c] text-[#030712] font-bold hover:bg-[#b8963e]">
              <Link href="/for-realtors">Join as a Hero Agent</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
