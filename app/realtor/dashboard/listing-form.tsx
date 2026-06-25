"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ListingForm() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const response = await fetch("/api/listings/manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget).entries())),
    });
    const data = (await response.json()) as { error?: string };

    setLoading(false);
    if (!response.ok) {
      setMessage(data.error || "Unable to submit listing.");
      return;
    }

    event.currentTarget.reset();
    setMessage("Listing submitted for admin review.");
  }

  return (
    <form className="grid gap-4 rounded-lg border border-white/10 bg-navy-850 p-5 sm:grid-cols-2" onSubmit={onSubmit}>
      <input name="company" className="hidden" tabIndex={-1} autoComplete="off" />
      {[
        ["address_line_1", "Address line 1"],
        ["address_line_2", "Address line 2"],
        ["city", "City"],
        ["state", "State"],
        ["zip", "Zip"],
        ["price", "Price"],
        ["beds", "Beds"],
        ["baths", "Baths"],
        ["sqft", "Sqft"],
        ["year_built", "Year built"],
        ["property_type", "Property type"],
        ["brokerage_name", "Brokerage"],
        ["listing_agent_name", "Agent name"],
        ["listing_agent_email", "Agent email"],
        ["listing_agent_phone", "Agent phone"],
      ].map(([name, label]) => (
        <div key={name} className="space-y-2">
          <Label htmlFor={name}>{label}</Label>
          <Input id={name} name={name} required={!["address_line_2", "listing_agent_phone"].includes(name)} />
        </div>
      ))}
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" />
      </div>
      <div className="sm:col-span-2">
        <Button className="w-full" disabled={loading}>
          {loading ? "Submitting..." : "Submit Listing for Review"}
        </Button>
        {message ? <p className="mt-3 text-sm text-gold-300">{message}</p> : null}
      </div>
    </form>
  );
}
