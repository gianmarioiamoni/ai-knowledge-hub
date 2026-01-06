// lib/server/resourceUsage.ts
import { createSupabaseServiceClient } from "./supabaseService";
import { getPlanLimits } from "./subscriptions";

export type ResourceUsage = {
  documents: { current: number; limit: number };
  conversations: { current: number; limit: number };
  procedures: { current: number; limit: number };
  contributors: { current: number; limit: number };
  viewers: { current: number; limit: number };
};

export async function getResourceUsage(
  organizationId: string,
  planId: string
): Promise<ResourceUsage> {
  const supabase = createSupabaseServiceClient();
  const limits = getPlanLimits(planId);

  // Get counts in parallel
  const [
    { count: documentsCount },
    { count: conversationsCount },
    { count: proceduresCount },
    { data: members },
  ] = await Promise.all([
    supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId),
    supabase
      .from("conversations")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId),
    supabase
      .from("procedures")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId),
    supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", organizationId),
  ]);

  // Count contributors and viewers
  const contributorsCount = members?.filter((m) => m.role === "CONTRIBUTOR").length ?? 0;
  const viewersCount = members?.filter((m) => m.role === "VIEWER").length ?? 0;

  return {
    documents: {
      current: documentsCount ?? 0,
      limit: limits.maxDocuments,
    },
    conversations: {
      current: conversationsCount ?? 0,
      limit: limits.maxConversations,
    },
    procedures: {
      current: proceduresCount ?? 0,
      limit: limits.maxProcedures,
    },
    contributors: {
      current: contributorsCount,
      limit: limits.maxContributors,
    },
    viewers: {
      current: viewersCount,
      limit: limits.maxViewers,
    },
  };
}


