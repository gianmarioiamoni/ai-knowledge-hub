import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

const getBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.VERCEL_URL ?? "http://localhost:3000";
  const normalized = envUrl.startsWith("http") ? envUrl : `https://${envUrl}`;
  return normalized.replace(/\/$/, "");
};

const getLanguageAlternates = (): NonNullable<Metadata["alternates"]>["languages"] => {
  const baseUrl = getBaseUrl();
  return routing.locales.reduce<Record<string, string>>((acc, locale) => {
    acc[locale] = `${baseUrl}/${locale}`;
    return acc;
  }, {});
};

type SeoInput = {
  locale: string;
  title: string;
  description: string;
  path?: string;
};

const buildMetadata = ({ locale, title, description, path = "" }: SeoInput): Metadata => {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/${locale}${path}`;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: `%s | AI Knowledge Hub`,
    },
    description,
    alternates: {
      canonical: url,
      languages: getLanguageAlternates(),
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "AI Knowledge Hub",
      locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
};

export { buildMetadata, getBaseUrl };




