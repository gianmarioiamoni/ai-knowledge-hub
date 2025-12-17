import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default intlMiddleware;

export const config = {
  matcher: [
    "/((?!api/|_next/static|_next/image|favicon.ico|manifest.webmanifest|robots.txt|sitemap.xml|messages/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json)$).*)",
  ],
};

