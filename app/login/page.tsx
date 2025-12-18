import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

export const metadata: Metadata = {
  title: "AI Knowledge Hub | Login",
  description: "Accedi o registrati per gestire i tuoi contenuti.",
};

export default function LoginPage(): never {
  const cookieLocale = cookies().get("preferred_locale")?.value;
  const locale = routing.locales.includes(cookieLocale ?? "") ? cookieLocale : routing.defaultLocale;
  redirect(`/${locale}/login`);
}

