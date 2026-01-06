import type { JSX } from "react";
import { RegularDashboard } from "./RegularDashboard";
import type {
  DashboardLabels,
  DashboardStat,
  PipelineStep,
  IngestionData,
} from "./types";
import type { ResourceUsage } from "@/lib/server/resourceUsage";

type DashboardPageProps = {
  labels: DashboardLabels;
  stats: DashboardStat[];
  pipelineSteps: PipelineStep[];
  nextActions: string[];
  ingestion: IngestionData;
  resourceUsage: ResourceUsage | null;
  locale: string;
};

export function DashboardPage({
  labels,
  stats,
  pipelineSteps,
  nextActions,
  ingestion,
  resourceUsage,
  locale,
}: DashboardPageProps): JSX.Element {
  return (
    <RegularDashboard
      labels={labels}
      stats={stats}
      pipelineSteps={pipelineSteps}
      nextActions={nextActions}
      ingestion={ingestion}
      resourceUsage={resourceUsage}
      locale={locale}
    />
  );
}

