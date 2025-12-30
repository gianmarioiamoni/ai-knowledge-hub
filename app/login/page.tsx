import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Knowledge Hub | Login",
  description: "Accedi o registrati per gestire i tuoi contenuti.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}): Promise<never> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("preferred_locale")?.value;
  const candidate = cookieLocale ?? "";
  const locale = routing.locales.includes(candidate as (typeof routing.locales)[number])
    ? (candidate as (typeof routing.locales)[number])
    : routing.defaultLocale;

  const query = new URLSearchParams();
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (typeof value === "string") {
        query.set(key, value);
      }
    });
  }

  const suffix = query.toString();
  const target = `/${locale}/login${suffix ? `?${suffix}` : ""}`;
  redirect(target);
}

