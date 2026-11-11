
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard/",
        "/workspaces/",
        "/settings/",
        "/meet/",
      ],
    },
    sitemap: "https://vynor.in/sitemap.xml",
  };
}
