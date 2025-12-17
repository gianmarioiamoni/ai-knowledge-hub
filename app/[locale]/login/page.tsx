import { getTranslations } from "next-intl/server";
import { JSX } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { BadgeBar } from "@/components/login/BadgeBar";
import { FormPanel } from "@/components/login/FormPanel";
import { Hero } from "@/components/login/Hero";
import { SellingPoints } from "@/components/login/SellingPoints";
import { StatsGrid } from "@/components/login/StatsGrid";
import type { Stat } from "@/components/login/StatsGrid";

export default async function LoginPage(): Promise<JSX.Element> {
  const t = await getTranslations("loginPage");

  const stats: Stat[] = [
    { label: t("stats.documents"), value: "1.2k", hint: "pgvector + RLS" },
    { label: t("stats.conversations"), value: "38k", hint: "GPT-4.1 + caching" },
    { label: t("stats.sops"), value: "640", hint: "Template operativi" },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden px-6 py-12 sm:py-16">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -left-32 -top-24 h-[36rem] w-[36rem] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-18rem] right-[-12rem] h-[32rem] w-[32rem] rounded-full bg-accent/25 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.22)_1px,transparent_0)] bg-[size:42px_42px] mix-blend-screen dark:opacity-20" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-10">
        <BadgeBar hint={t("badgeHint")} />

        <div className="grid items-start justify-items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:justify-items-stretch">
          <div className="space-y-8">
            <Hero title={t("title")} highlight={t("highlight")} description={t("description")} />
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
          </FormPanel>
        </div>
      </div>
    </div>
  );
}

