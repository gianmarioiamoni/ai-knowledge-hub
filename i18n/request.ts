import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ locale }) => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("preferred_locale")?.value;
  const fallbackLocale = routing.defaultLocale;
  const isValidCookieLocale = cookieLocale && routing.locales.includes(cookieLocale);

  const actualLocale = locale || (isValidCookieLocale ? cookieLocale : fallbackLocale);
  const messages = (await import(`../messages/${actualLocale}.json`)).default;

  return {
    locale: actualLocale,
    messages,
  };
});

