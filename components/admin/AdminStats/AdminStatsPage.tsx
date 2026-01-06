import type { JSX } from "react";
import type { PlatformStats, AdminStatsLabels } from "./types";
import { StatCard } from "./StatCard";
import { DocumentsByStatus } from "./DocumentsByStatus";
import { TimeSeriesCharts } from "./TimeSeriesCharts";
import { PlanDistribution } from "./PlanDistribution";
import { UserGrowth } from "./UserGrowth";
import { TopOrganizations } from "./TopOrganizations";
import { EngagementMetrics } from "./EngagementMetrics";
import { LAYOUT_CLASSES } from "@/lib/styles/layout";

type AdminStatsPageProps = {
  stats: PlatformStats;
  labels: AdminStatsLabels;
};

export function AdminStatsPage({ stats, labels }: AdminStatsPageProps): JSX.Element {
  return (
    <div className={LAYOUT_CLASSES.pageContainerWide}>
      {/* Header */}
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{labels.title}</p>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">{labels.subtitle}</h1>
        <p className="text-sm text-muted-foreground">{labels.description}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={labels.users}
          value={stats.usersTotal}
          hint={labels.banned.replace("{count}", String(stats.bannedUsers))}
        />
        <StatCard
          label={labels.orgs}
          value={stats.organizationsTotal}
          hint={labels.members.replace("{count}", String(stats.membersTotal))}
        />
        <StatCard
          label={labels.documents}
          value={stats.documentsTotal}
          hint={labels.procedures.replace("{count}", String(stats.proceduresTotal))}
        />
        <StatCard
          label={labels.conversations}
          value={stats.conversationsTotal}
          hint={labels.procedures.replace("{count}", String(stats.proceduresTotal))}
        />
      </div>

      {/* Engagement Metrics */}
      <EngagementMetrics
        title={labels.engagement}
        metrics={stats.engagementMetrics}
        labels={{
          avgDocsPerOrg: labels.avgDocsPerOrg,
          avgChatsPerOrg: labels.avgChatsPerOrg,
          avgSopsPerOrg: labels.avgSopsPerOrg,
          avgMembersPerOrg: labels.avgMembersPerOrg,
          activeUsers7d: labels.activeUsers7d,
          activeUsers30d: labels.activeUsers30d,
        }}
      />

      {/* Charts Grid - 2 columns */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Plan Distribution */}
        <PlanDistribution
          title={labels.planDistribution}
          distribution={stats.planDistribution}
          labels={{
            trial: "Trial",
            demo: "Demo",
            smb: "SMB",
            enterprise: "Enterprise",
            expired: "Expired",
            none: "None",
          }}
          noDataLabel={labels.noData}
        />

        {/* Documents by Status */}
        <DocumentsByStatus
          title={labels.docsByStatus}
          documentsByStatus={stats.documentsByStatus}
          noDataLabel={labels.noData}
        />
      </div>

      {/* User Growth - Full Width */}
      <UserGrowth title={labels.userGrowth30d} data={stats.userGrowth30d} noDataLabel={labels.noData} />

      {/* Activity Time Series - 2 columns */}
      <TimeSeriesCharts
        conversationsTitle={labels.conversations7d}
        proceduresTitle={labels.procedures7d}
        conversations7d={stats.conversations7d}
        procedures7d={stats.procedures7d}
      />

      {/* Top Organizations - Full Width */}
      <TopOrganizations
        title={labels.topOrganizations}
        organizations={stats.topOrganizations}
        labels={{
          orgName: labels.orgName,
          membersLabel: labels.members,
          docs: labels.docs,
          chats: labels.chats,
          sops: labels.sops,
          plan: labels.plan,
          total: labels.total,
        }}
        noDataLabel={labels.noData}
      />
    </div>
  );
}

