import type { Metadata } from "next";

export const siteUrl = "https://askhero.net";
export const siteName = "AskHero";
export const defaultTitle = "AskHero | Search Homes with Hero AI";
export const defaultDescription =
  "AskHero helps home buyers search homes, compare offers, understand the deal, and connect directly with agents using advanced Hero AI.";

export const publicRoutes = [
  {
    path: "/",
    title: defaultTitle,
    description: defaultDescription,
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    path: "/search",
    title: "Search Homes with Hero AI | AskHero",
    description:
      "Search homes in plain English. AskHero analyzes budget, lifestyle, location fit, and opportunity across approved listings.",
    changeFrequency: "daily",
    priority: 0.95,
  },
  {
    path: "/hero-score",
    title: "Hero Score | AskHero Home-Buying Intelligence",
    description:
      "Learn how Hero Score helps buyers understand value, negotiation leverage, neighborhood context, risk, condition, and growth potential.",
    changeFrequency: "monthly",
    priority: 0.85,
  },
  {
    path: "/for-realtors",
    title: "AskHero for Realtors | Qualified Buyer Interest",
    description:
      "Realtors can join AskHero, submit real listings for review, and connect with informed buyers in launch markets.",
    changeFrequency: "monthly",
    priority: 0.75,
  },
  {
    path: "/about",
    title: "About AskHero | AI Real Estate Search",
    description:
      "AskHero is an AI-powered real estate search and home-buying intelligence platform built to help buyers make smarter home decisions.",
    changeFrequency: "monthly",
    priority: 0.65,
  },
  {
    path: "/contact",
    title: "Contact AskHero | Support and Partnerships",
    description:
      "Contact AskHero for support, realtor interest, listing data, partnerships, or product questions.",
    changeFrequency: "monthly",
    priority: 0.55,
  },
  {
    path: "/privacy",
    title: "Privacy | AskHero",
    description: "Read how AskHero handles submitted signup, contact, realtor, and product information.",
    changeFrequency: "yearly",
    priority: 0.35,
  },
  {
    path: "/terms",
    title: "Terms | AskHero",
    description: "Read AskHero terms, product disclaimers, and informational-use guidance.",
    changeFrequency: "yearly",
    priority: 0.35,
  },
] as const;

export function absoluteUrl(path = "/") {
  return new URL(path, siteUrl).toString();
}

export function createPageMetadata({
  path,
  title,
  description,
  noIndex = false,
}: {
  path: string;
  title: string;
  description: string;
  noIndex?: boolean;
}): Metadata {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-snippet": -1,
            "max-image-preview": "large",
            "max-video-preview": -1,
          },
        },
    openGraph: {
      title,
      description,
      url,
      siteName,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}