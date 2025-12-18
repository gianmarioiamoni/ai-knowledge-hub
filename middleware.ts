import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const [, maybeLocale] = pathname.split("/");

  const hasLocale = routing.locales.includes(maybeLocale);
  const response = NextResponse.next();

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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};

