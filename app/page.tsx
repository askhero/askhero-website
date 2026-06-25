import { LandingPage } from "@/components/landing-page";
import { PageShell } from "@/components/site-shell";
import { absoluteUrl, createPageMetadata, defaultDescription, defaultTitle, siteName, siteUrl } from "@/lib/seo";

export const metadata = createPageMetadata({
  path: "/",
  title: defaultTitle,
  description: defaultDescription,
});

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: siteName,
      url: siteUrl,
      logo: absoluteUrl("/favicon.svg"),
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: "support@askhero.net",
          url: absoluteUrl("/contact"),
        },
        {
          "@type": "ContactPoint",
          contactType: "sales",
          email: "hello@askhero.net",
          url: absoluteUrl("/for-realtors"),
        },
      ],
      sameAs: [siteUrl],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: siteName,
      url: siteUrl,
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "WebApplication",
      "@id": `${siteUrl}/#webapp`,
      name: siteName,
      url: siteUrl,
      applicationCategory: "RealEstateApplication",
      operatingSystem: "Web",
      description: defaultDescription,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/PreOrder",
      },
    },
  ],
};

export default function HomePage() {
  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPage />
    </PageShell>
  );
}