import { getTranslations } from "next-intl/server";
import { JSX } from "react";
import { redirect } from "@/i18n/navigation";
import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { BadgePills } from "@/components/dashboard/BadgePills";
import { HeaderBar } from "@/components/dashboard/HeaderBar";
import { IngestionCard } from "@/components/dashboard/IngestionCard";
import { ProgressCard } from "@/components/dashboard/ProgressCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { StatusCard } from "@/components/dashboard/StatusCard";
import { getIngestionStats } from "@/lib/server/documents";
import { ensureUserOrganization } from "@/lib/server/organizations";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";

type DashboardPageProps = {
  params: Promise<{ locale: string }> | { locale: string };
};

export default async function DashboardPage({ params }: DashboardPageProps): Promise<JSX.Element> {
  const { locale } = await params;
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  const user = data.user;

  if (error || !user) {
    redirect({ href: "/login", locale });
    return null as never;
  }

  const email = user.email ?? "User";
  const t = await getTranslations({ locale, namespace: "dashboard" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const organizationId = await ensureUserOrganization({ supabase });
  const ingestion = await getIngestionStats(organizationId);

  const stats = [
    { label: t("stats.documents"), value: "128", delta: t("stats.deltas.documents") },
    { label: t("stats.conversations"), value: "3.4k", delta: t("stats.deltas.conversations") },
    { label: t("stats.sops"), value: "640", delta: t("stats.deltas.sops") },
    { label: t("stats.users"), value: "42", delta: t("stats.deltas.users") },
  ];

  const pipeline = [
    { title: t("pipeline.upload"), desc: t("pipeline.uploadDesc") },
    { title: t("pipeline.chunking"), desc: t("pipeline.chunkingDesc") },
    { title: t("pipeline.chat"), desc: t("pipeline.chatDesc") },
    { title: t("pipeline.sop"), desc: t("pipeline.sopDesc") },
  ];

  const nextActions = t.raw("actions") as string[];

  const logoutButton = (
    <form action={signOut} className="flex items-center justify-end">
      <Button variant="outline">{tCommon("logout")}</Button>
    </form>
  );

  return (
    <div className="relative min-h-screen overflow-hidden px-6 py-12">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -left-28 -top-32 h-[36rem] w-[36rem] rounded-full bg-primary/18 blur-[120px]" />
        <div className="absolute right-[-18rem] top-[-12rem] h-[28rem] w-[28rem] rounded-full bg-accent/18 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.18)_1px,transparent_0)] bg-[size:44px_44px] mix-blend-screen dark:opacity-20" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-8">
        <HeaderBar
          title={t("title")}
          headline={t("user", { email })}
          actionSlot={logoutButton}
        />

        <BadgePills
          badgeLabel={t("title")}
          title={t("title")}
          headline={t("headline")}
          subtitle={t("subtitle")}
          pills={[
            { label: t("tenant") },
            { label: t("pgvector") },
            { label: t("sop") },
          ]}
        />

        <StatusCard title={t("quickActions")}>
          <QuickActions
            labels={{
              upload: t("pipeline.upload"),
              chat: t("pipeline.chat"),
              sop: t("pipeline.sop"),
            }}
          />
        </StatusCard>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <StatusCard key={item.label} title={item.label}>
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-semibold text-foreground">{item.value}</span>
                <span className="text-sm text-muted-foreground">{item.delta}</span>
              </div>
            </StatusCard>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.9fr]">
          <StatusCard title={t("pipelineTitle")}>
            <p className="text-sm text-muted-foreground">{t("pipelineDesc")}</p>
            <div className="space-y-4">
              {pipeline.map((item, idx) => (
                <div
                  key={item.title}
                  className="flex items-start gap-4 rounded-2xl border border-white/40 bg-white/70 p-4 shadow-inner backdrop-blur dark:border-white/10 dark:bg-white/5"
                >
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary ring-1 ring-primary/20">
                    {idx + 1}
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </StatusCard>

          <div className="space-y-4">
            <StatusCard title={t("recommended")}>
              <p className="text-sm text-muted-foreground">{t("recommendedDesc")}</p>
              <div className="space-y-3">
                {nextActions.map((action) => (
                  <div
                    key={action}
                    className="flex items-start gap-3 rounded-2xl border border-white/40 bg-white/70 p-4 text-sm font-semibold text-foreground shadow-inner backdrop-blur dark:border-white/10 dark:bg-white/5"
                  >
                    <span className="mt-0.5 size-2 rounded-full bg-primary shadow-[0_0_0_6px_rgba(79,70,229,0.14)]" />
                    {action}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-3 rounded-2xl border border-white/40 bg-gradient-to-br from-primary/10 via-secondary/20 to-accent/10 p-4 text-sm text-foreground shadow-md backdrop-blur dark:border-white/10 dark:from-primary/20 dark:via-secondary/10 dark:to-accent/10">
                <div className="flex items-center gap-2 font-semibold">
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                    •
                  </span>
                  {t("kpiTitle")}
                </div>
                <p className="text-sm text-muted-foreground">{t("kpiDesc")}</p>
              </div>
            </StatusCard>

            <IngestionCard
              title={t("ingestion.title")}
              ingestedLabel={t("ingestion.ingested")}
              processingLabel={t("ingestion.processing")}
              lastIngestedLabel={t("ingestion.lastIngested")}
              notAvailableLabel={t("ingestion.notAvailable")}
              ingestedCount={ingestion.ingestedCount}
              processingCount={ingestion.processingCount}
              lastIngestedAt={ingestion.lastIngestedAt}
              locale={locale}
            />
          </div>
        </div>

        <StatusCard title={t("integrity")}>
          <ProgressCard
            title={t("integrity")}
            subtitle={t("synced")}
            progress={88}
            syncedLabel="12/14"
          />
        </StatusCard>
      </div>
    </div>
  );
}

