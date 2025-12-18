import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

export default function ChatRedirect(): never {
  const cookieLocale = cookies().get("preferred_locale")?.value;
  const locale = routing.locales.includes(cookieLocale ?? "") ? cookieLocale! : routing.defaultLocale;
  redirect(`/${locale}/chat`);
}

