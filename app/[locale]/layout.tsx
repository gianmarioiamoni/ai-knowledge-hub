import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { routing } from "@/i18n/routing";
import { CommandPalette } from "@/components/navigation/CommandPalette";
import { CommandHint } from "@/components/navigation/CommandHint";
import { CommandLauncher } from "@/components/navigation/CommandLauncher";
import { TopNav } from "@/components/navigation/TopNav";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SentryClientInit } from "@/components/SentryClientInit";
import { CookieBanner } from "@/components/CookieBanner/CookieBanner";
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

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SentryClientInit />
          <div className="relative z-50 mx-auto flex w-full max-w-6xl items-center justify-end gap-3 px-6 pt-4 sm:px-6 sm:pt-6 lg:px-6 xl:px-0">
            <TopNav />
            <CommandHint />
            <CommandLauncher />
            <LanguageSwitcher />
            <CommandPalette />
          </div>
          {children}
          <CookieBanner
            message={messages.cookies.banner.message}
            acceptLabel={messages.cookies.banner.accept}
            declineLabel={messages.cookies.banner.decline}
            policyLabel={messages.cookies.banner.policy}
            policyHref="/privacy"
            manageLabel={messages.cookies.banner.manage}
          />
          <FooterLinks
            privacyLabel={messages.cookies.banner.policy}
            cookiesLabel={messages.cookies.banner.manage}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

