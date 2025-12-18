import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlProxy = createMiddleware({
  ...routing,
  // Force default locale (en) unless a NEXT_LOCALE cookie is present.
  // Disables Accept-Language auto-detection to avoid unexpected locale switches.
  localeDetection: false,
});

export default function proxy(request: NextRequest) {
  const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

  if (process.env.NODE_ENV !== "production") {
    // Debug: trace incoming path and detected locale to diagnose redirects
    console.info("[proxy] incoming", {
      pathname: request.nextUrl.pathname,
      search: request.nextUrl.search,
      locale: request.nextUrl.locale,
    });
  }

  const response = intlProxy(request);

  const [, maybeLocale] = request.nextUrl.pathname.split("/");
  const hasLocale = routing.locales.includes(maybeLocale);
  if (hasLocale) {
    const cookieLocale = request.cookies.get("preferred_locale")?.value;
    if (cookieLocale !== maybeLocale) {
      response.cookies.set("preferred_locale", maybeLocale, {
        path: "/",
        maxAge: ONE_YEAR_SECONDS,
      });
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api/|_next/static|_next/image|favicon.ico|manifest.webmanifest|robots.txt|sitemap.xml|messages/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json)$).*)",
  ],
};

