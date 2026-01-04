import type { JSX } from "react";
import { RegularDashboard } from "./RegularDashboard";
import type {
  DashboardLabels,
  DashboardStat,
  PipelineStep,
  IngestionData,
} from "./types";

type DashboardPageProps = {
  labels: DashboardLabels;
  stats: DashboardStat[];
  pipelineSteps: PipelineStep[];
  nextActions: string[];
  ingestion: IngestionData;
  locale: string;
};

export function DashboardPage({
  labels,
  stats,
  pipelineSteps,
  nextActions,
  ingestion,
  locale,
}: DashboardPageProps): JSX.Element {
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

