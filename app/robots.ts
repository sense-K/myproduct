import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/config";

// PRD 9.5.4
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/me/", "/submit/", "/feedback/", "/api/", "/verify"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
