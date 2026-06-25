"use client";

import { FormEvent, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  MapPinned,
  Star,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isValidEmail, isValidPhone } from "@/lib/form-validation";
import { askHeroLaunchMarkets } from "@/lib/markets";

const scoreItems = [
  {
    label: "Estimated Safe Budget",
    value: "Calculated after search",
    description: "Uses your income only when you provide it.",
  },
  {
    label: "Hero Score",
    value: "Pending approved listing",
    description: "Ranks the opportunity when real listing facts exist.",
  },
  {
    label: "Hero Fit",
    value: "Based on your profile",
    description: "Matches budget, family, commute, and lifestyle intent.",
  },
  {
    label: "Hero Risk",
    value: "Available facts only",
    description: "Flags known and missing risk data clearly.",
  },
  {
    label: "Hero 5-Year Outlook",
    value: "Real market data required",
    description: "Shown only when supporting data is available.",
  },
];
const heroSteps = [
  {
    title: "Analyze Market Value",
    text: "Compare a home against nearby signals before deciding what it may be worth.",
    icon: BarChart3,
  },
  {
    title: "Evaluate Neighborhood Quality",
    text: "Review location factors that can shape daily life and long-term confidence.",
    icon: MapPinned,
  },
  {
    title: "Assess Property Risk",
    text: "Surface possible risk areas so buyers know what deserves closer attention.",
    icon: ShieldCheck,
  },
  {
    title: "Identify Negotiation Opportunities",
    text: "Find leverage signals that can support a more informed offer strategy.",
    icon: TrendingUp,
  },
  {
    title: "Generate Hero Score",
    text: "Bring the findings together into one clear preview of buyer opportunity.",
    icon: Sparkles,
  },
];

const markets = ["Charlotte, NC", "Raleigh, NC", "Atlanta, GA", "Nashville, TN"];

const buyerReasons = [
  {
    title: "Hero Score",
    text: "Ranks the opportunity, not just the listing.",
  },
  {
    title: "Hero Fit",
    text: "Measures how well a home matches your budget, family, and lifestyle.",
  },
  {
    title: "Hero Risk",
    text: "Highlights missing or available risk signals like crime, flood, insurance, and location risk.",
  },
  {
    title: "Hero 5-Year Outlook",
    text: "Shows possible appreciation only when real market data is available.",
  },
];
type FormState = "idle" | "loading" | "success" | "error";
type RealtorErrors = Partial<Record<"name" | "email" | "phone" | "brokerage" | "market", string>>;

async function submitJson(path: string, formData: FormData) {
  const body = Object.fromEntries(formData.entries());
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await response.json()) as { error?: string; success?: boolean; warning?: string; message?: string; next?: string };

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong.");
  }

  return data;
}

export function LandingPage() {
  const [waitlistState, setWaitlistState] = useState<FormState>("idle");
  const [waitlistMessage, setWaitlistMessage] = useState("");
  const [realtorOpen, setRealtorOpen] = useState(false);
  const [realtorState, setRealtorState] = useState<FormState>("idle");
  const [realtorMessage, setRealtorMessage] = useState("");
  const [realtorErrors, setRealtorErrors] = useState<RealtorErrors>({});

  async function handleWaitlistSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWaitlistState("loading");
    const form = event.currentTarget;
    setWaitlistMessage("");

    try {
      await submitJson("/api/waitlist", new FormData(form));
      setWaitlistState("success");
      setWaitlistMessage("Thanks. Your AskHero signup has been received.");
      form.reset();
      trackEvent("waitlist_submit");
    } catch (error) {
      setWaitlistState("error");
      setWaitlistMessage(
        error instanceof Error ? error.message : "Unable to submit signup.",
      );
    }
  }

  async function handleRealtorSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const errors = validateRealtorForm(formData);
    setRealtorErrors(errors);
    setRealtorMessage("");

    if (Object.keys(errors).length > 0) {
      setRealtorState("error");
      return;
    }

    setRealtorState("loading");

    try {
      const data = await submitJson("/api/realtor-signup", formData);
      setRealtorState("success");
      setRealtorMessage(data.message || "Thank you for signing up for launch. You can now create a free Hero listing with Hero Listing Builder™ and list homes faster.");
      form.reset();
      trackEvent("realtor_submit");
    } catch (error) {
      setRealtorState("error");
      setRealtorMessage(
        error instanceof Error ? error.message : "Unable to send signup.",
      );
    }
  }


  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden border-b border-white/8">
        <div className="mx-auto flex min-h-[820px] max-w-6xl flex-col items-center px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-20">
          <div className="flex w-full max-w-4xl flex-col items-center justify-center">
            <div className="mb-7 inline-flex w-fit items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/[0.07] px-3 py-1 text-xs font-bold text-gold-300 shadow-[0_0_35px_rgba(217,180,92,0.10)]">
              <Sparkles className="h-3.5 w-3.5" />
              Find Better Deals Before Everyone Else
            </div>
            <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.04] tracking-normal text-white sm:text-5xl lg:text-6xl">
              Find the homes actually worth buying.
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-white/68 sm:text-xl">
              AskHero analyzes budget, schools, crime, neighborhood quality, commute, and long-term potential so buyers can make smarter decisions before making an offer.
            </p>
            <form
              action="/search"
              className="mt-9 w-full max-w-4xl rounded-[2rem] border border-white/12 bg-white/[0.06] p-2 text-left shadow-[0_30px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl transition focus-within:border-gold-400/60 focus-within:shadow-[0_0_0_1px_rgba(217,180,92,0.28),0_0_90px_rgba(217,180,92,0.14)]"
            >
              <div className="rounded-[1.55rem] border border-white/8 bg-[#07111f]/90 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gold-400 text-[#030712] shadow-[0_0_40px_rgba(217,180,92,0.24)]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <textarea
                    name="q"
                    rows={5}
                    placeholder="Tell Hero what you're looking for... family size, income, city, schools, safety, commute, budget, lifestyle"
                    aria-label="Search homes with Hero AI"
                    className="min-h-40 flex-1 resize-none rounded-2xl border border-gold-400/30 bg-navy-900/80 px-4 py-3 text-base leading-7 text-white outline-none placeholder:text-white/40 focus:border-gold-400/70 sm:text-lg"
                  />
                </div>
                <div className="mt-4 flex flex-col gap-3 border-t border-white/8 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-white/48">Ask in plain English. Hero ranks approved homes against your real buyer intent.</p>
                  <Button className="h-12 rounded-2xl px-6" type="submit">
                    Ask Hero <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </form>
            <div className="mt-6 w-full max-w-4xl rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-left shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-300">Example Hero Search</p>
              <p className="mt-3 text-sm leading-6 text-white/70 sm:text-base">
                I have a family of 4 and $200k income. I want a home in Charlotte with school priority, safety signals, nearby grocery access, and long-term value data.
              </p>
            </div>
          </div>

          <div id="hero-score" className="relative isolate mt-8 w-full max-w-4xl overflow-visible">
            <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-400/16 blur-[130px]" />
            <div className="hero-card-shadow relative rounded-2xl border border-white/10 bg-[#0b1322]/92 p-5 backdrop-blur-xl">
              <div className="rounded-xl border border-gold-400/20 bg-[#07111f] p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gold-400/35 bg-white/[0.035] text-gold-300">
                      <Star className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-base font-extrabold text-white">Hero Analysis Preview</p>
                      <p className="mt-0.5 text-sm text-white/58">Here&apos;s what Hero analyzes for every home.</p>
                    </div>
                  </div>
                  <span className="rounded-full border border-gold-300/25 bg-gold-400/8 px-3 py-1 text-xs font-bold text-gold-200">
                    Pre-launch preview
                  </span>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  {scoreItems.map((item) => (
                    <div key={item.label} className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
                      <p className="text-xs text-white/62">{item.label}</p>
                      <p className="mt-2 text-sm font-extrabold text-gold-300">{item.value}</p>
                      <p className="mt-2 text-xs leading-5 text-white/52">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4 text-sm text-white/58 sm:flex-row sm:items-center">
            <Button size="lg" variant="secondary" asChild className="h-11 w-fit px-5">
              <a href="/signup">
                Sign Up
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <span>Explore homes with Hero AI before you make an offer.</span>
          </div>
        </div>
        <div id="markets" className="border-t border-white/8 bg-[#030712]/72">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-6 text-sm text-white/64 sm:px-6 md:flex-row md:justify-center lg:px-8">
            <span>Coming Soon to</span>
            <div className="flex flex-wrap justify-center gap-3">
              {markets.map((market) => (
                <span
                  key={market}
                  className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-4 py-2 font-bold text-white"
                >
                  <MapPinned className="h-4 w-4 text-gold-300" />
                  {market.replace(", NC", "").replace(", GA", "").replace(", TN", "")}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section id="features" className="border-y border-white/8 bg-white/[0.025]">
        <div className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="How Hero Score Works"
            title="Five checks before you write the offer."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {heroSteps.map((item) => (
              <FeatureCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      </section>

      <section id="launch-markets" className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Launching Soon Markets"
          title="Starting with high-growth Southeast markets."
        />
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {markets.map((market) => (
            <div
              key={market}
              className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.045] p-5"
            >
              <MapPinned className="h-5 w-5 text-gold-300" />
              <span className="font-medium">{market}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/8 bg-navy-850/72">
        <div className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Why Hero is different"
            title="Built to answer whether a home is worth deeper review."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {buyerReasons.map((reason) => (
              <div
                key={reason.title}
                className="rounded-lg border border-white/10 bg-white/[0.04] p-5"
              >
                <CheckCircle2 className="h-5 w-5 text-gold-300" />
                <h3 className="mt-4 text-lg font-semibold">{reason.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/64">{reason.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="agents" className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-lg border border-gold-400/22 bg-gold-400/8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-300">
              For Realtors
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">
              Get Free Qualified Buyer Leads During Launch
            </h2>
            <p className="mt-4 max-w-2xl text-white/68">
              Join the launch interest list for the markets AskHero is preparing
              to support.
            </p>
          </div>
          <Dialog open={realtorOpen} onOpenChange={setRealtorOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                Join as a Realtor <Building2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{realtorState === "success" ? "Welcome to AskHero" : "Join as a Realtor"}</DialogTitle>
                {realtorState === "success" ? null : (
                  <DialogDescription>
                    Create your free AskHero realtor account and start building listings faster with Hero Listing Builder™.
                  </DialogDescription>
                )}
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleRealtorSubmit} noValidate>
                {realtorState === "success" ? (
                  <div className="rounded-2xl border border-gold-300/30 bg-white/[0.045] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gold-300/40 bg-gold-400 text-[#030712] shadow-gold">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <p className="mt-4 text-sm leading-6 text-white/72">
                      {realtorMessage || "Thank you for signing up for launch. You can now create a free Hero listing with Hero Listing Builder™ and list homes faster."}
                    </p>
                    <Button asChild variant="secondary" className="mt-5 w-full">
                      <a href="/dashboard/listings/new">
                        Create Free Hero Listing
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </Button>
                    <p className="mt-3 text-xs leading-5 text-white/48">
                      Hero Listing Builder™ helps you turn plain English, photos, and video into a polished listing draft.
                    </p>
                  </div>
                ) : (
                  <>
                    <RealtorField name="name" label="Full Name" autoComplete="name" error={realtorErrors.name} required />
                    <RealtorField name="email" label="Email" type="email" autoComplete="email" error={realtorErrors.email} required />
                    <RealtorField name="phone" label="Phone" type="tel" autoComplete="tel" placeholder="7045551212" error={realtorErrors.phone} required />
                    <RealtorField name="brokerage" label="Brokerage" error={realtorErrors.brokerage} required />
                    <div className="space-y-2">
                      <RequiredLabel htmlFor="realtor-market">Market</RequiredLabel>
                      <select
                        id="realtor-market"
                        name="market"
                        required
                        defaultValue=""
                        aria-invalid={Boolean(realtorErrors.market)}
                        aria-describedby={realtorErrors.market ? "realtor-market-error" : undefined}
                        className="h-11 w-full rounded-md border border-white/10 bg-[#0d1117] px-3 py-2 text-sm text-white shadow-sm outline-none focus:ring-2 focus:ring-gold-400 aria-[invalid=true]:border-red-300 aria-[invalid=true]:focus:ring-red-300"
                      >
                        <option value="" disabled>Select launch market</option>
                        {askHeroLaunchMarkets.map((market) => (
                          <option key={market} value={market}>{market}</option>
                        ))}
                      </select>
                      <InlineError id="realtor-market-error" message={realtorErrors.market} />
                    </div>
                    <p className="text-xs font-semibold text-gold-200">All fields are required.</p>
                    <Button className="w-full" disabled={realtorState === "loading"}>
                      {realtorState === "loading" ? "Sending..." : "Join as a Realtor"}
                    </Button>
                    <StatusMessage state={realtorState} message={realtorMessage} />
                  </>
                )}
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <section id="waitlist" className="border-y border-white/8 bg-white/[0.025]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-18 sm:px-6 lg:grid-cols-[0.85fr_1fr] lg:px-8">
          <div>
            <SectionHeading
              eyebrow="AskHero Account"
              title="Sign up for AskHero."
            />
            <p className="mt-5 max-w-xl text-white/68">
              Tell us where you are searching so AskHero can help you compare homes,
              understand the deal, and connect with the right agents.
            </p>
          </div>
          <form
            className="grid gap-4 rounded-lg border border-white/10 bg-navy-850 p-5 sm:grid-cols-2 sm:p-6"
            onSubmit={handleWaitlistSubmit}
          >
            <Field name="first_name" label="First name" autoComplete="given-name" required />
            <Field name="last_name" label="Last name" autoComplete="family-name" required />
            <div className="sm:col-span-2">
              <Field name="email" label="Email" type="email" autoComplete="email" required />
            </div>
            <Field name="city" label="City" autoComplete="address-level2" />
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select name="role" defaultValue="Buyer">
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {["Buyer", "Seller", "Realtor", "Investor"].map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Button className="w-full" size="lg" disabled={waitlistState === "loading"}>
                {waitlistState === "loading" ? "Submitting..." : "Sign Up"}
              </Button>
              <StatusMessage state={waitlistState} message={waitlistMessage} />
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-300">
        {eyebrow}
      </p>
      <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-normal text-white sm:text-4xl">
        {title}
      </h2>
    </div>
  );
}

function FeatureCard({
  title,
  text,
  icon: Icon,
}: {
  title: string;
  text: string;
  icon: typeof BarChart3;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-md bg-gold-400/10 text-gold-300">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-5 text-lg font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-white/64">{text}</p>
    </div>
  );
}

function Field({
  label,
  name,
  ...props
}: {
  label: string;
  name: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} {...props} />
    </div>
  );
}

function RealtorField({
  label,
  name,
  error,
  ...props
}: {
  label: string;
  name: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const errorId = `${name}-error`;
  return (
    <div className="space-y-2">
      <RequiredLabel htmlFor={name}>{label}</RequiredLabel>
      <Input
        id={name}
        name={name}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="aria-[invalid=true]:border-red-300 aria-[invalid=true]:focus:ring-red-300"
        {...props}
      />
      <InlineError id={errorId} message={error} />
    </div>
  );
}

function RequiredLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <Label htmlFor={htmlFor}>
      {children} <span className="text-gold-300" aria-hidden="true">*</span>
    </Label>
  );
}

function InlineError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return <p id={id} className="text-sm font-medium text-red-300">{message}</p>;
}

function validateRealtorForm(formData: FormData): RealtorErrors {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const brokerage = String(formData.get("brokerage") || "").trim();
  const market = String(formData.get("market") || "").trim();
  const errors: RealtorErrors = {};

  if (!name) errors.name = "Full name is required.";
  if (!email || !isValidEmail(email)) errors.email = "Please enter a valid email address.";
  if (!phone || !isValidPhone(phone)) errors.phone = "Please enter a valid 10-digit phone number.";
  if (!brokerage) errors.brokerage = "Brokerage is required.";
  if (!market || !askHeroLaunchMarkets.includes(market as (typeof askHeroLaunchMarkets)[number])) {
    errors.market = "Please select your market.";
  }

  return errors;
}

function StatusMessage({ state, message }: { state: FormState; message: string }) {
  if (!message) {
    return null;
  }

  return (
    <p
      className={`mt-3 text-sm ${
        state === "success" ? "text-gold-300" : "text-red-300"
      }`}
      role="status"
    >
      {message}
    </p>
  );
}
