import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AskHero",
    short_name: "AskHero",
    description:
      "AskHero helps home buyers search homes, compare offers, understand the deal, and connect with agents using Hero AI.",
    start_url: "/",
    display: "standalone",
    background_color: "#030712",
    theme_color: "#d9b45c",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}