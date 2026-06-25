export function getBlendEmbedConfig(user) {
  return {
    provider: "Blend",
    available: Boolean(process.env.BLEND_API_KEY),
    embedUrl: process.env.BLEND_API_KEY ? "https://blend.com/embed/prequal" : null,
    borrowerEmail: user?.email || null
  };
}
