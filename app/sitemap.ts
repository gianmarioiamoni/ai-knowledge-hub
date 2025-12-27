import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getBaseUrl } from "@/lib/seo";

const paths = ["", "/login", "/dashboard", "/documents", "/chat", "/procedures", "/privacy"];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();
  const lastModified = new Date();

  return routing.locales.flatMap((locale) =>
    paths.map((path) => ({
      url: `${baseUrl}/${locale}${path}`,
      lastModified,
      changeFrequency: "weekly",
      priority: path === "" ? 0.9 : 0.7,
    }))
  );
}



