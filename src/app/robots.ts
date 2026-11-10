import type { MetadataRoute } from "next";
import { absoluteUrl, site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // Пока сайт не на боевом домене — закрыт от индексации целиком.
  if (!site.indexable) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/spasibo"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: site.url,
  };
}
