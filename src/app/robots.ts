import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: ["/", "/i/", "/u/", "/explore"], disallow: ["/today", "/inbox", "/library", "/actions", "/settings", "/api/"] }], sitemap: `${siteUrl()}/sitemap.xml` };
}
