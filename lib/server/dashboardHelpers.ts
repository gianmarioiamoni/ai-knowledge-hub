import { getTranslations } from "next-intl/server";
import type { DashboardLabels, DashboardStat, PipelineStep } from "@/components/dashboard/types";

type GetDashboardLabelsParams = {
  locale: string;
};

export async function getDashboardLabels({
  locale,
}: GetDashboardLabelsParams): Promise<DashboardLabels> {
  const t = await getTranslations({ locale, namespace: "dashboard" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  const greetingPrefix = t("user", { email: "" }).trim() || "Hi,";

  const labels: DashboardLabels = {
    title: t("title"),
    headline: t("headline"),
    subtitle: t("subtitle"),
    greetingPrefix,
    email: "", // Will be set by the page
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

  return labels;
}

type BuildDashboardStatsParams = {
  locale: string;
  documents: number;
  conversations: number;
  procedures: number;
  members: number;
};

export async function buildDashboardStats({
  locale,
  documents,
  conversations,
  procedures,
  members,
}: BuildDashboardStatsParams): Promise<DashboardStat[]> {
  const t = await getTranslations({ locale, namespace: "dashboard" });

  return [
    {
      label: t("stats.documents"),
      value: documents.toLocaleString(locale),
      delta: t("stats.deltas.documents"),
    },
    {
      label: t("stats.conversations"),
      value: conversations.toLocaleString(locale),
      delta: t("stats.deltas.conversations"),
    },
    {
      label: t("stats.sops"),
      value: procedures.toLocaleString(locale),
      delta: t("stats.deltas.sops"),
    },
    {
      label: t("stats.users"),
      value: members.toLocaleString(locale),
      delta: t("stats.deltas.users"),
    },
  ];
}

export async function buildPipelineSteps(locale: string): Promise<PipelineStep[]> {
  const t = await getTranslations({ locale, namespace: "dashboard" });

  return [
    { title: t("pipeline.upload"), desc: t("pipeline.uploadDesc") },
    { title: t("pipeline.chunking"), desc: t("pipeline.chunkingDesc") },
    { title: t("pipeline.chat"), desc: t("pipeline.chatDesc") },
    { title: t("pipeline.sop"), desc: t("pipeline.sopDesc") },
  ];
}

export async function getNextActions(locale: string): Promise<string[]> {
  const t = await getTranslations({ locale, namespace: "dashboard" });
  return t.raw("actions") as string[];
}

