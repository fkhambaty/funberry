import type { MetadataRoute } from "next";

const PUBLIC_PATHS = ["", "/pricing", "/privacy", "/terms", "/login", "/signup", "/forgot-password"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date("2026-10-13T00:00:00.000Z");
  return PUBLIC_PATHS.map((path) => ({
    url: `https://www.funberrykids.in${path}`,
    lastModified: now,
    changeFrequency: path === "" || path === "/pricing" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.6,
  }));
}
