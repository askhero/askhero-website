"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trackEvent } from "@/lib/analytics";

export function ContactForm() {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setMessage("");

    const form = event.currentTarget;
    const body = Object.fromEntries(new FormData(form).entries());
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await response.json()) as { error?: string; warning?: string };

    if (!response.ok) {
      setState("error");
      setMessage(data.error || "Unable to send message.");
      return;
    }

    setState("success");
    setMessage(data.warning || "Thanks. Your message has been sent.");
    form.reset();
    trackEvent("contact_submit");
  }

  return (
    <form className="space-y-4 rounded-lg border border-white/10 bg-navy-850 p-5" onSubmit={onSubmit}>
      <input name="company" className="hidden" tabIndex={-1} autoComplete="off" />
      <input name="sourcePage" type="hidden" value="/contact" />
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required autoComplete="name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" type="tel" autoComplete="tel" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" name="subject" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" required />
      </div>
      <Button className="w-full" disabled={state === "loading"}>
        {state === "loading" ? "Sending..." : "Send Message"}
      </Button>
      {message ? (
        <p className={state === "success" ? "text-sm text-gold-300" : "text-sm text-red-300"}>
          {message}
        </p>
      ) : null}
    </form>
  );
}