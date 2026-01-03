import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import type { JSX } from "react";
import { redirect } from "@/i18n/navigation";
import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { DashboardPage } from "@/components/dashboard";
import { getIngestionStats } from "@/lib/server/documents";
import { ensureUserOrganization } from "@/lib/server/organizations";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import { getDashboardStats } from "@/lib/server/stats";
import { buildMetadata } from "@/lib/seo";
import { ensureActivePlan } from "@/lib/server/subscriptions";

export const dynamic = "force-dynamic";

type DashboardPageRouteProps = {
  params: Promise<{ locale: string }> | { locale: string };
  searchParams?: Promise<{ forcePassword?: string }> | { forcePassword?: string };
};

export async function generateMetadata({ params }: DashboardPageRouteProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard" });
  return buildMetadata({
    locale,
    title: t("title"),
    description: t("subtitle"),
    path: "/dashboard",
  });
}

export default async function DashboardPageRoute({
  params,
  searchParams,
}: DashboardPageRouteProps): Promise<JSX.Element> {
  const { locale } = await params;
  const resolvedSearch = searchParams ? await searchParams : undefined;

  // Auth check
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect({ href: "/login", locale });
  }

  // Non-null assertion safe here because redirect throws
  const user = data.user!;

  // Plan check
  ensureActivePlan(user, locale);

  // Force password redirect
  if (resolvedSearch?.forcePassword === "true") {
    redirect({ href: "/profile?forcePassword=true", locale });
  }

  // User metadata
  const email = user.email ?? "User";
  const role = (user.user_metadata as { role?: string } | null)?.role;
  const isSuperAdmin = role === "SUPER_ADMIN";

  // Translations
  const t = await getTranslations({ locale, namespace: "dashboard" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  // Greeting
  const greetingPrefix = t("user", { email: "" }).trim() || "Hi,";

  // Logout button
  const logoutButton = (
    <form action={signOut} className="flex items-center justify-end">
      <Button variant="outline">{tCommon("logout")}</Button>
    </form>
  );

  // Super Admin Labels
  const adminLabels = isSuperAdmin
    ? {
        title: t("super.title"),
        subtitle: t("super.subtitle"),
        email: t("super.email"),
        role: t("super.role"),
        status: t("super.status"),
        created: t("super.created"),
        actions: t("super.actions"),
        loading: t("super.loading"),
        refresh: t("super.refresh"),
        promote: t("super.promote"),
        demote: t("super.demote"),
        disable: t("super.disable"),
        enable: t("super.enable"),
        delete: t("super.delete"),
        banned: t("super.banned"),
        active: t("super.active"),
        error: t("super.error"),
        ok: t("super.ok"),
      }
    : undefined;

  // Regular user data fetching
  const organizationId = await ensureUserOrganization({ supabase });
  const ingestion = await getIngestionStats(organizationId);
  const statsData = await getDashboardStats(organizationId, ingestion);

  // Stats
  const stats = [
    {
      label: t("stats.documents"),
      value: statsData.documents.toLocaleString(locale),
      delta: t("stats.deltas.documents"),
    },
    {
      label: t("stats.conversations"),
      value: statsData.conversations.toLocaleString(locale),
      delta: t("stats.deltas.conversations"),
    },
    {
      label: t("stats.sops"),
      value: statsData.procedures.toLocaleString(locale),
      delta: t("stats.deltas.sops"),
    },
    {
      label: t("stats.users"),
      value: statsData.members.toLocaleString(locale),
      delta: t("stats.deltas.users"),
    },
  ];

  // Pipeline steps
  const pipelineSteps = [
    { title: t("pipeline.upload"), desc: t("pipeline.uploadDesc") },
    { title: t("pipeline.chunking"), desc: t("pipeline.chunkingDesc") },
    { title: t("pipeline.chat"), desc: t("pipeline.chatDesc") },
    { title: t("pipeline.sop"), desc: t("pipeline.sopDesc") },
  ];

  // Next actions
  const nextActions = t.raw("actions") as string[];

  // Labels
  const labels = {
    title: t("title"),
    headline: t("headline"),
    subtitle: t("subtitle"),
    greetingPrefix,
    email,
    profileTooltip: t("profileTooltip"),
    logout: tCommon("logout"),
    tenant: t("tenant"),
    pgvector: t("pgvector"),
    sop: t("sop"),
    quickActions: t("quickActions"),
    quickActionsUpload: t("pipeline.upload"),
    quickActionsChat: t("pipeline.chat"),
    quickActionsSop: t("pipeline.sop"),
    pipelineTitle: t("pipelineTitle"),
    pipelineDesc: t("pipelineDesc"),
    recommended: t("recommended"),
    recommendedDesc: t("recommendedDesc"),
    kpiTitle: t("kpiTitle"),
    kpiDesc: t("kpiDesc"),
    ingestionTitle: t("ingestion.title"),
    ingestionIngested: t("ingestion.ingested"),
    ingestionProcessing: t("ingestion.processing"),
    ingestionLastIngested: t("ingestion.lastIngested"),
    ingestionNotAvailable: t("ingestion.notAvailable"),
    integrity: t("integrity"),
    synced: t("synced"),
  };

  return (
    <DashboardPage
      isSuperAdmin={isSuperAdmin}
      labels={labels}
      adminLabels={adminLabels}
      stats={stats}
      pipelineSteps={pipelineSteps}
      nextActions={nextActions}
      ingestion={ingestion}
      locale={locale}
      logoutButton={logoutButton}
    />
  );
}

