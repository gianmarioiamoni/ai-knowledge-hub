import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { routing } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import { CommandPalette } from "@/components/navigation/CommandPalette";
import { CommandHint } from "@/components/navigation/CommandHint";
import { CommandLauncher } from "@/components/navigation/CommandLauncher";
import { TopNav } from "@/components/navigation/TopNav";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SentryClientInit } from "@/components/SentryClientInit";
import { CookieBanner } from "@/components/CookieBanner/CookieBanner";
import { Toaster } from "@/components/ui/sonner";
import { FooterLinks } from "@/components/navigation/FooterLinks";
import "@/app/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return buildMetadata({
    locale,
    title: t("defaultTitle"),
    description: t("defaultDescription"),
    path: "",
  });
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  const messages = await getMessages({ locale });
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const role = (data.user?.user_metadata as { role?: string } | null)?.role ?? null;
  const isAuthenticated = Boolean(data.user);

  const tDashboard = await getTranslations({ locale, namespace: "dashboard" });
  const tDocuments = await getTranslations({ locale, namespace: "documentsPage" });
  const tChat = await getTranslations({ locale, namespace: "chatPage" });
  const tProcedures = await getTranslations({ locale, namespace: "proceduresPage" });
  const tPlans = await getTranslations({ locale, namespace: "plans" });
  const tHelp = await getTranslations({ locale, namespace: "help" });
  const tInvites = await getTranslations({ locale, namespace: "invites" });

  const baseNav = [
    { label: tDashboard("title"), href: "/dashboard" },
    { label: tDocuments("title"), href: "/documents" },
    { label: tChat("title"), href: "/chat" },
    { label: tProcedures("title"), href: "/procedures" },
  ];

  const plansNav = role === "COMPANY_ADMIN" ? [{ label: tPlans("title"), href: "/plans" }] : [];

  const invitesNav =
    role === "COMPANY_ADMIN"
      ? [{ label: tInvites("title"), href: "/invites" }]
      : [];

  const publicNav = [{ label: tPlans("title"), href: "/pricing" }];

  const superNav = [
    { label: tDashboard("title"), href: "/dashboard" },
    { label: tDashboard("super.statsNav"), href: "/admin-stats" },
    { label: "Users", href: "/admin/users" },
  ];

  const navItems = isAuthenticated
    ? role === "SUPER_ADMIN"
      ? superNav
      : [...baseNav, ...plansNav, ...invitesNav]
    : publicNav;
  const orgName =
    (data.user?.user_metadata as { organization_name?: string } | null)?.organization_name ??
    null;

  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SentryClientInit />
          <div className="relative z-50 mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-6 pt-4 sm:px-6 sm:pt-6 lg:px-6 xl:px-0">
            {role !== "SUPER_ADMIN" && orgName ? (
              <span className="hidden rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary ring-1 ring-primary/20 sm:inline">
                {orgName}
              </span>
            ) : (
              <span />
            )}
            <div className="flex items-center justify-end gap-3">
              <TopNav items={navItems} helpHref="/help" helpLabel={tHelp("title")} />
              <CommandHint />
              <CommandLauncher />
              <LanguageSwitcher />
              <CommandPalette />
            </div>
          </div>
          {children}
          <CookieBanner
            message={messages.cookies.banner.message}
            acceptLabel={messages.cookies.banner.accept}
            declineLabel={messages.cookies.banner.decline}
            policyLabel={messages.cookies.banner.policy}
            policyHref={`/${locale}/privacy`}
            manageLabel={messages.cookies.banner.manage}
          />
          <Toaster position="top-right" richColors />
          <FooterLinks
            privacyLabel={messages.cookies.banner.policy}
            cookiesLabel={messages.cookies.banner.manage}
            contactLabel={messages.contact?.link ?? "Contact"}
            locale={locale}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

