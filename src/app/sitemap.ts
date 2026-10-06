import type { MetadataRoute } from "next";

const SITE_URL = "https://progrestive.mhmdfjr.com";

// Only public routes are listed. Auth-gated app pages (/home, /report,
// /leaderboard, /profile) and auth pages (/login, /register) are intentionally
// excluded and carry robots noindex in their group layouts.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
