"use client";

import type { JSX } from "react";
import { SuperAdminDashboard } from "./SuperAdminDashboard";
import { RegularDashboard } from "./RegularDashboard";
import type {
  DashboardLabels,
  SuperAdminLabels,
  DashboardStat,
  PipelineStep,
  IngestionData,
} from "./types";

type DashboardPageProps = {
  isSuperAdmin: boolean;
  labels: DashboardLabels;
  adminLabels?: SuperAdminLabels;
  stats: DashboardStat[];
  pipelineSteps: PipelineStep[];
  nextActions: string[];
  ingestion: IngestionData;
  locale: string;
};

export function DashboardPage({
  isSuperAdmin,
  labels,
  adminLabels,
  stats,
  pipelineSteps,
  nextActions,
  ingestion,
  locale,
}: DashboardPageProps): JSX.Element {
  if (isSuperAdmin && adminLabels) {
    return (
      <SuperAdminDashboard
        title={labels.title}
        greetingPrefix={labels.greetingPrefix}
        email={labels.email}
        profileTooltip={labels.profileTooltip}
        adminLabels={adminLabels}
      />
    );
  }

  return (
    <RegularDashboard
      labels={labels}
      stats={stats}
      pipelineSteps={pipelineSteps}
      nextActions={nextActions}
      ingestion={ingestion}
      locale={locale}
    />
  );
}

