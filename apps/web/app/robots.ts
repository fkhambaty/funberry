import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/play", "/admin", "/api/"],
    },
    sitemap: "https://www.funberrykids.in/sitemap.xml",
    host: "https://www.funberrykids.in",
  };
}
