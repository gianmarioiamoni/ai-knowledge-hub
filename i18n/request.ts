import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ locale }) => {
  const actualLocale = locale || "en";
  const messages = (await import(`../messages/${actualLocale}.json`)).default;

  return {
    locale: actualLocale,
    messages,
  };
});

