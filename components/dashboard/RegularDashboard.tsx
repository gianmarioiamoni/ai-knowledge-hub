"use client";

import type { JSX } from "react";
import { BadgePills } from "./BadgePills";
import { HeaderBar } from "./HeaderBar";
import { QuickActions } from "./QuickActions";
import { StatusCard } from "./StatusCard";
import { IngestionCard } from "./IngestionCard";
import { ProgressCard } from "./ProgressCard";
import { BackgroundGradient } from "./BackgroundGradient";
import { StatsGrid } from "./StatsGrid";
import { PipelineCard } from "./PipelineCard";
import { RecommendedActionsCard } from "./RecommendedActionsCard";
import type { DashboardLabels, DashboardStat, PipelineStep, IngestionData } from "./types";
import { LAYOUT_CLASSES } from "@/lib/styles/layout";

type RegularDashboardProps = {
  labels: DashboardLabels;
  stats: DashboardStat[];
  pipelineSteps: PipelineStep[];
  nextActions: string[];
  ingestion: IngestionData;
  locale: string;
  logoutButton: JSX.Element;
};

export function RegularDashboard({
  labels,
  stats,
  pipelineSteps,
  nextActions,
  ingestion,
  locale,
  logoutButton,
}: RegularDashboardProps): JSX.Element {
  return (
    <div className={`relative min-h-screen overflow-hidden ${LAYOUT_CLASSES.horizontalPadding} py-12`}>
      <BackgroundGradient />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8">
        <HeaderBar
          title={labels.title}
          headlinePrefix={labels.greetingPrefix}
          headlineLinkLabel={labels.email}
          headlineHref="/profile"
          headlineTooltip={labels.profileTooltip}
          actionSlot={logoutButton}
        />

        <BadgePills
          showBadge={false}
          showTitle
          title={labels.title}
          headline={labels.headline}
          subtitle={labels.subtitle}
          pills={[{ label: labels.tenant }, { label: labels.pgvector }, { label: labels.sop }]}
        />

        <StatusCard title={labels.quickActions}>
          <QuickActions
            labels={{
              upload: labels.quickActionsUpload,
              chat: labels.quickActionsChat,
              sop: labels.quickActionsSop,
            }}
          />
        </StatusCard>

        <StatsGrid stats={stats} />

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.9fr]">
          <PipelineCard
            title={labels.pipelineTitle}
            description={labels.pipelineDesc}
            steps={pipelineSteps}
          />

          <div className="space-y-4">
            <RecommendedActionsCard
              title={labels.recommended}
              description={labels.recommendedDesc}
              actions={nextActions}
              kpiTitle={labels.kpiTitle}
              kpiDescription={labels.kpiDesc}
            />

            <IngestionCard
              title={labels.ingestionTitle}
              ingestedLabel={labels.ingestionIngested}
              processingLabel={labels.ingestionProcessing}
              lastIngestedLabel={labels.ingestionLastIngested}
              notAvailableLabel={labels.ingestionNotAvailable}
              ingestedCount={ingestion.ingestedCount}
              processingCount={ingestion.processingCount}
              lastIngestedAt={ingestion.lastIngestedAt ?? undefined}
              locale={locale}
            />
          </div>
        </div>

        <StatusCard title={labels.integrity}>
          <ProgressCard
            title={labels.integrity}
            subtitle={labels.synced}
            progress={88}
            syncedLabel="12/14"
          />
        </StatusCard>
      </div>
    </div>
  );
}

