import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

export const dynamic = "force-dynamic";

export default async function ChatRedirect(): Promise<never> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("preferred_locale")?.value;
  const candidate = cookieLocale ?? "";
  const locale = routing.locales.includes(candidate as (typeof routing.locales)[number])
    ? (candidate as (typeof routing.locales)[number])
    : routing.defaultLocale;
  redirect(`/${locale}/chat`);
}

