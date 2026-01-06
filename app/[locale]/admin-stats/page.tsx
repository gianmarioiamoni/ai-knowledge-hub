import { getTranslations } from "next-intl/server";
import type { JSX } from "react";
import { redirect } from "@/i18n/navigation";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import { getPlatformStats } from "@/lib/server/adminStats";
import { AdminStatsPage } from "@/components/admin/AdminStats";

export const dynamic = "force-dynamic";

export default async function AdminStatsRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<JSX.Element> {
  const { locale } = await params;

  // Auth check
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect({ href: "/login", locale });
  }

  // Non-null assertion safe here because redirect throws
  const role = (data.user!.user_metadata as { role?: string } | null)?.role;
  if (role !== "SUPER_ADMIN") {
    redirect({ href: "/dashboard", locale });
  }

  // Translations
  const t = await getTranslations({ locale, namespace: "adminStats" });

  // Data fetching
  const stats = await getPlatformStats();

  return (
    <AdminStatsPage
      stats={stats}
      labels={{
        title: t("title"),
        subtitle: t("subtitle"),
        description: t("description"),
        users: t("users"),
        orgs: t("orgs"),
        documents: t("documents"),
        conversations: t("conversations"),
        banned: t("banned", { count: stats.bannedUsers }),
        members: t("members", { count: stats.membersTotal }),
        procedures: t("procedures", { count: stats.proceduresTotal }),
        docsByStatus: t("docsByStatus"),
        conversations7d: t("conversations7d"),
        procedures7d: t("procedures7d"),
        noData: t("noData"),
        planDistribution: t("planDistribution"),
        userGrowth30d: t("userGrowth30d"),
        topOrganizations: t("topOrganizations"),
        engagement: t("engagement"),
        avgDocsPerOrg: t("avgDocsPerOrg"),
        avgChatsPerOrg: t("avgChatsPerOrg"),
        avgSopsPerOrg: t("avgSopsPerOrg"),
        avgMembersPerOrg: t("avgMembersPerOrg"),
        activeUsers7d: t("activeUsers7d"),
        activeUsers30d: t("activeUsers30d"),
        orgName: t("orgName"),
        docs: t("docs"),
        chats: t("chats"),
        sops: t("sops"),
        plan: t("plan"),
        total: t("total"),
      }}
    />
  );
}

