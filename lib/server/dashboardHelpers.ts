import type { User } from "@supabase/supabase-js";
import { getTranslations } from "next-intl/server";
import type { DashboardLabels, SuperAdminLabels, DashboardStat, PipelineStep } from "@/components/dashboard/types";

type GetDashboardLabelsParams = {
  locale: string;
  email: string;
  isSuperAdmin: boolean;
};

type DashboardLabelsResult = {
  labels: DashboardLabels;
  adminLabels?: SuperAdminLabels;
};

export async function getDashboardLabels({
  locale,
  email,
  isSuperAdmin,
}: GetDashboardLabelsParams): Promise<DashboardLabelsResult> {
  const t = await getTranslations({ locale, namespace: "dashboard" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  const greetingPrefix = t("user", { email: "" }).trim() || "Hi,";

  const labels: DashboardLabels = {
    title: t("title"),
    headline: t("headline"),
    subtitle: t("subtitle"),
    greetingPrefix,
    email,
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

  const adminLabels: SuperAdminLabels | undefined = isSuperAdmin
    ? {
        title: t("super.title"),
        subtitle: t("super.subtitle"),
        email: t("super.email"),
        role: t("super.role"),
        status: t("super.status"),
        created: t("super.created"),
        actions: t("super.actions"),
        loading: t("super.loading"),
        refresh: t("super.refresh"),
        promote: t("super.promote"),
        demote: t("super.demote"),
        disable: t("super.disable"),
        enable: t("super.enable"),
        delete: t("super.delete"),
        banned: t("super.banned"),
        active: t("super.active"),
        error: t("super.error"),
        ok: t("super.ok"),
        cancel: t("super.cancel"),
        deleteUserTitle: t("super.deleteUserTitle"),
        deleteUserDesc: t("super.deleteUserDesc"),
      }
    : undefined;

  return { labels, adminLabels };
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

export function extractUserRole(user: User): { role: string | null; isSuperAdmin: boolean } {
  const role = (user.user_metadata as { role?: string } | null)?.role ?? null;
  const isSuperAdmin = role === "SUPER_ADMIN";
  return { role, isSuperAdmin };
}

