import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { JSX } from "react";
import { redirect } from "@/i18n/navigation";
import { cookies } from "next/headers";
import { AuthForm } from "@/components/auth/AuthForm";
import { SupabaseHashHandler } from "@/components/auth/SupabaseHashHandler";
import { BadgeBar } from "@/components/login/BadgeBar";
import { FormPanel } from "@/components/login/FormPanel";
import { Hero } from "@/components/login/Hero";
import { SellingPoints } from "@/components/login/SellingPoints";
import { StatsGrid } from "@/components/login/StatsGrid";
import type { Stat } from "@/components/login/StatsGrid";
import { buildMetadata } from "@/lib/seo";
import { Alert } from "@/components/ui/alert";
import { routing } from "@/i18n/routing";

type LoginPageProps = {
  params: Promise<{ locale: string }> | { locale: string };
  searchParams?:
    | Promise<{ error?: string; code?: string; type?: string; next?: string }>
    | { error?: string; code?: string; type?: string; next?: string };
};

export async function generateMetadata({ params }: LoginPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "loginPage" });
  const title = `${t("title")} ${t("highlight")}`.trim();
  return buildMetadata({
    locale,
    title,
    description: t("description"),
    path: "/login",
  });
}

export default async function LoginPage({ params, searchParams }: LoginPageProps): Promise<JSX.Element> {
  const { locale } = await params;
  const { error, code, type, next } = (searchParams ? await searchParams : {}) ?? {};

  // Handle Supabase magic link / password reset callbacks that land on /login
  if (code) {
    const targetNext = typeof next === "string" && next.length > 0 ? next : `/${locale}/dashboard`;
    redirect({
      href: `/auth/callback?code=${encodeURIComponent(code)}${type ? `&type=${encodeURIComponent(type)}` : ""}&next=${encodeURIComponent(targetNext)}`,
      locale,
    });
  }
  const t = await getTranslations({ locale, namespace: "loginPage" });

  const stats: Stat[] = [
    { label: t("stats.documents"), value: "1.2k", hint: t("statsHints.documents") },
    { label: t("stats.conversations"), value: "38k", hint: t("statsHints.conversations") },
    { label: t("stats.sops"), value: "640", hint: t("statsHints.sops") },
  ];

  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("preferred_locale")?.value;
  const candidate = cookieLocale ?? "";
  const localeFromCookie = routing.locales.includes(candidate as (typeof routing.locales)[number])
    ? (candidate as (typeof routing.locales)[number])
    : routing.defaultLocale;

  if (!locale) {
    redirect({ href: "/login", locale: localeFromCookie });
  }

  const errorMessage =
    error === "org_disabled"
      ? locale === "it"
        ? "La tua organizzazione è stata disabilitata. Contatta l’amministratore."
        : "Your organization has been disabled. Please contact your administrator."
      : null;

  return (
    <div className="relative min-h-screen overflow-hidden px-6 py-12 sm:py-16">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -left-32 -top-24 h-[36rem] w-[36rem] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-18rem] right-[-12rem] h-[32rem] w-[32rem] rounded-full bg-accent/25 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.22)_1px,transparent_0)] bg-[size:42px_42px] mix-blend-screen dark:opacity-20" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-10">
        <BadgeBar label={t("badgeLabel")} hint={t("badgeHint")} />

        <div className="grid items-start justify-items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:justify-items-stretch">
          <div className="space-y-8">
            {errorMessage ? (
              <Alert variant="destructive">
                <p className="text-sm font-medium">{errorMessage}</p>
              </Alert>
            ) : null}
            <Hero
              title={t("title")}
              highlight={t("highlight")}
              suffix={t("titleSuffix")}
              description={t("description")}
            />
            <StatsGrid stats={stats} />
            <SellingPoints
              items={[
                { label: t("selling.onboarding"), tone: "primary", icon: true },
                { label: t("selling.pipeline"), tone: "accent" },
                { label: t("selling.ui"), tone: "secondary" },
              ]}
            />
          </div>

          <FormPanel>
            <AuthForm />
            <SupabaseHashHandler redirectTo={`/${locale}/dashboard`} />
          </FormPanel>
        </div>
      </div>
    </div>
  );
}

