import type { MetadataRoute } from "next";

const SITE_URL = "https://progrestive.mhmdfjr.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/home",
          "/report",
          "/leaderboard",
          "/profile",
          "/login",
          "/register",
          "/api/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
