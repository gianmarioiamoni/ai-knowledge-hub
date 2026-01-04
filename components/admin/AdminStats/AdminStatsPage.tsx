import type { JSX } from "react";
import type { PlatformStats, AdminStatsLabels } from "./types";
import { StatCard } from "./StatCard";
import { DocumentsByStatus } from "./DocumentsByStatus";
import { TimeSeriesCharts } from "./TimeSeriesCharts";
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
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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

      {/* Details Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <DocumentsByStatus
          title={labels.docsByStatus}
          documentsByStatus={stats.documentsByStatus}
          noDataLabel={labels.noData}
        />
        <TimeSeriesCharts
          conversationsTitle={labels.conversations7d}
          proceduresTitle={labels.procedures7d}
          conversations7d={stats.conversations7d}
          procedures7d={stats.procedures7d}
        />
      </div>
    </div>
  );
}

