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
import {
  getDashboardLabels,
  buildDashboardStats,
  buildPipelineSteps,
  getNextActions,
  extractUserRole,
} from "@/lib/server/dashboardHelpers";

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
  const { isSuperAdmin } = extractUserRole(user);

  // Translations and labels
  const { labels, adminLabels } = await getDashboardLabels({ locale, email, isSuperAdmin });

  // Data fetching
  const organizationId = await ensureUserOrganization({ supabase });
  const ingestion = await getIngestionStats(organizationId);
  const statsData = await getDashboardStats(organizationId, ingestion);

  // Build UI data structures
  const stats = await buildDashboardStats({
    locale,
    documents: statsData.documents,
    conversations: statsData.conversations,
    procedures: statsData.procedures,
    members: statsData.members,
  });
  const pipelineSteps = await buildPipelineSteps(locale);
  const nextActions = await getNextActions(locale);

  // Logout button
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const logoutButton = (
    <form action={signOut} className="flex items-center justify-end">
      <Button variant="outline">{tCommon("logout")}</Button>
    </form>
  );

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

