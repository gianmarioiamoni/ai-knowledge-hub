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
import { ResourceUsageCard } from "./ResourceUsageCard";
import { LogoutButton } from "@/components/common/LogoutButton";
import type { DashboardLabels, DashboardStat, PipelineStep, IngestionData } from "./types";
import type { ResourceUsage } from "@/lib/server/resourceUsage";
import { LAYOUT_CLASSES } from "@/lib/styles/layout";

type RegularDashboardProps = {
  labels: DashboardLabels;
  stats: DashboardStat[];
  pipelineSteps: PipelineStep[];
  nextActions: string[];
  ingestion: IngestionData;
  resourceUsage: ResourceUsage | null;
  locale: string;
};

export function RegularDashboard({
  labels,
  stats,
  pipelineSteps,
  nextActions,
  ingestion,
  resourceUsage,
  locale,
}: RegularDashboardProps): JSX.Element {
  return (
    <div className="relative min-h-screen overflow-hidden py-12">
      <BackgroundGradient />

      <div className={`relative mx-auto flex w-full max-w-6xl flex-col gap-8 ${LAYOUT_CLASSES.horizontalPadding}`}>
        <HeaderBar
          title={labels.title}
          headlinePrefix={labels.greetingPrefix}
          headlineLinkLabel={labels.email}
          headlineHref="/profile"
          headlineTooltip={labels.profileTooltip}
          actionSlot={<LogoutButton label={labels.logout} variant="outline" />}
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

        {resourceUsage && (
          <ResourceUsageCard
            usage={resourceUsage}
            labels={{
              title: labels.resourceUsageTitle,
              documents: labels.resourceUsageDocuments,
              conversations: labels.resourceUsageConversations,
              procedures: labels.resourceUsageProcedures,
              contributors: labels.resourceUsageContributors,
              viewers: labels.resourceUsageViewers,
              of: labels.resourceUsageOf,
            }}
          />
        )}

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

