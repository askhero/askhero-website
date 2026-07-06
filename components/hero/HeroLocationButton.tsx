"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, MapPin, X } from "lucide-react";
import { calculateDistance } from "@/lib/utils/distance";

const CHARLOTTE = { lat: 35.2271, lng: -80.8431 };
const CHARLOTTE_MAX_RADIUS_MILES = 60;
const LS_KEY = "askhero_user_location";

type Status = "idle" | "loading" | "active" | "denied";

export function HeroLocationButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("idle");

  // Restore from localStorage on mount — if we have a stored location but
  // the URL lost the params (e.g. user navigated away and back), re-inject them.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (searchParams.get("lat")) {
      setStatus("active");
      return;
    }
    const stored = readStoredLocation();
    if (!stored) return;
    setStatus("active");
    const params = new URLSearchParams(searchParams.toString());
    params.set("lat", stored.lat.toFixed(6));
    params.set("lng", stored.lng.toFixed(6));
    router.replace(`/search?${params.toString()}`);
  }, []); // intentionally run once on mount

  function handleLocate() {
    if (!("geolocation" in navigator)) {
      applyFallback();
      return;
    }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        localStorage.setItem(LS_KEY, JSON.stringify({ lat, lng }));
        setStatus("active");
        pushLocation(lat, lng);
      },
      () => applyFallback(),
      { timeout: 10_000 },
    );
  }

  function applyFallback() {
    setStatus("denied");
    // still push Charlotte center so the server can default-filter
    pushLocation(CHARLOTTE.lat, CHARLOTTE.lng);
  }

  function handleClear() {
    localStorage.removeItem(LS_KEY);
    setStatus("idle");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("lat");
    params.delete("lng");
    router.push(`/search?${params.toString()}`);
  }

  function pushLocation(lat: number, lng: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("lat", lat.toFixed(6));
    params.set("lng", lng.toFixed(6));
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {status === "idle" && (
        <button
          type="button"
          onClick={handleLocate}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.055] px-4 py-2 text-sm text-white/58 transition hover:border-[#c9a84c]/40 hover:bg-[#c9a84c]/6 hover:text-white/80"
        >
          <MapPin className="h-3.5 w-3.5 text-[#c9a84c]" />
          Use my location
        </button>
      )}

      {status === "loading" && (
        <span className="inline-flex items-center gap-2 text-sm text-white/46">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-[#c9a84c]" />
          Detecting location…
        </span>
      )}

      {status === "active" && (
        <span className="inline-flex items-center gap-2 rounded-full border border-[#c9a84c]/35 bg-[#c9a84c]/8 px-4 py-1.5 text-sm font-semibold text-[#c9a84c]">
          <MapPin className="h-3.5 w-3.5" />
          Showing homes near you
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear location filter"
            className="ml-0.5 text-[#c9a84c]/55 transition hover:text-[#c9a84c]"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      )}

      {status === "denied" && (
        <span className="text-sm text-white/44">
          Location unavailable — showing Charlotte area homes
        </span>
      )}
    </div>
  );
}

function readStoredLocation(): { lat: number; lng: number } | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const { lat, lng } = JSON.parse(raw) as { lat: unknown; lng: unknown };
    if (typeof lat !== "number" || typeof lng !== "number") return null;
    return { lat, lng };
  } catch {
    return null;
  }
}

export function isOutsideCharlotte(lat: number, lng: number): boolean {
  return calculateDistance(lat, lng, CHARLOTTE.lat, CHARLOTTE.lng) > CHARLOTTE_MAX_RADIUS_MILES;
}
