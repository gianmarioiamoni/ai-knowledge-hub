import { createSupabaseServiceClient } from "@/lib/server/supabaseService";
import { logError } from "@/lib/server/logger";

type PlanDistribution = {
  trial: number;
  demo: number;
  smb: number;
  enterprise: number;
  expired: number;
  none: number;
};

type TopOrganization = {
  id: string;
  name: string;
  memberCount: number;
  documentCount: number;
  conversationCount: number;
  procedureCount: number;
  plan: string;
};

type EngagementMetrics = {
  avgDocsPerOrg: number;
  avgChatsPerOrg: number;
  avgSopsPerOrg: number;
  avgMembersPerOrg: number;
  activeUsers7d: number;
  activeUsers30d: number;
};

type PlatformStats = {
  usersTotal: number;
  bannedUsers: number;
  organizationsTotal: number;
  membersTotal: number;
  documentsTotal: number;
  conversationsTotal: number;
  proceduresTotal: number;
  documentsByStatus: Record<string, number>;
  conversations7d: Array<{ label: string; count: number }>;
  procedures7d: Array<{ label: string; count: number }>;
  planDistribution: PlanDistribution;
  userGrowth30d: Array<{ label: string; count: number }>;
  topOrganizations: TopOrganization[];
  engagementMetrics: EngagementMetrics;
};

const countTable = async (table: string): Promise<number> => {
  const supabase = createSupabaseServiceClient();
  const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
  if (error) {
    logError("adminStats countTable failed", { table, error: error.message });
    throw error;
  }
  return count ?? 0;
};

const getPlatformStats = async (): Promise<PlatformStats> => {
  const supabase = createSupabaseServiceClient();

  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
  if (usersError) {
    logError("adminStats listUsers failed", { error: usersError.message });
    throw usersError;
  }
  const usersTotal = usersData.users?.length ?? 0;
  const bannedUsers =
    usersData.users?.filter((u) => Boolean((u as { banned_until?: string | null }).banned_until)).length ?? 0;

  const [organizationsTotal, membersTotal, documentsTotal, conversationsTotal, proceduresTotal] = await Promise.all([
    countTable("organizations"),
    countTable("organization_members"),
    countTable("documents"),
    countTable("conversations"),
    countTable("procedures"),
  ]);

  const { data: docsRows, error: docsError } = await supabase.from("documents").select("status");
  if (docsError) {
    logError("adminStats documents status failed", { error: docsError.message });
    throw docsError;
  }
  const documentsByStatus = (docsRows ?? []).reduce<Record<string, number>>((acc, row) => {
    const status = (row as { status?: string }).status ?? "unknown";
    acc[status] = (acc[status] ?? 0) + 1;
    return acc;
  }, {});

  const since = new Date();
  since.setDate(since.getDate() - 6);
  const sinceIso = since.toISOString();

  const { data: convRows, error: convError } = await supabase
    .from("conversations")
    .select("created_at")
    .gte("created_at", sinceIso);
  if (convError) {
    logError("adminStats conversations window failed", { error: convError.message });
    throw convError;
  }
  const { data: procRows, error: procError } = await supabase
    .from("procedures")
    .select("created_at")
    .gte("created_at", sinceIso);
  if (procError) {
    logError("adminStats procedures window failed", { error: procError.message });
    throw procError;
  }

  const makeSeries = (rows: Array<{ created_at?: string | null }>) => {
    const buckets = new Map<string, number>();
    for (let i = 0; i < 7; i += 1) {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const label = d.toISOString().slice(5, 10); // MM-DD
      buckets.set(label, 0);
    }
    rows.forEach((r) => {
      const date = r.created_at ? new Date(r.created_at) : null;
      if (!date) return;
      const label = date.toISOString().slice(5, 10);
      if (buckets.has(label)) {
        buckets.set(label, (buckets.get(label) ?? 0) + 1);
      }
    });
    return Array.from(buckets.entries()).map(([label, count]) => ({ label, count }));
  };

  const conversations7d = makeSeries(convRows ?? []);
  const procedures7d = makeSeries(procRows ?? []);

  // Plan distribution
  const planDistribution: PlanDistribution = { trial: 0, demo: 0, smb: 0, enterprise: 0, expired: 0, none: 0 };
  usersData.users?.forEach((user) => {
    const planId = ((user.user_metadata as { plan?: { id?: string } } | null)?.plan?.id ?? "none") as string;
    if (planId in planDistribution) {
      planDistribution[planId as keyof PlanDistribution] += 1;
    } else {
      planDistribution.none += 1;
    }
  });

  // User growth (last 30 days)
  const since30d = new Date();
  since30d.setDate(since30d.getDate() - 29);
  const userGrowth30d = (() => {
    const buckets = new Map<string, number>();
    for (let i = 0; i < 30; i += 1) {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const label = d.toISOString().slice(5, 10); // MM-DD
      buckets.set(label, 0);
    }
    usersData.users?.forEach((user) => {
      const createdAt = user.created_at ? new Date(user.created_at) : null;
      if (!createdAt) return;
      const label = createdAt.toISOString().slice(5, 10);
      if (buckets.has(label)) {
        buckets.set(label, (buckets.get(label) ?? 0) + 1);
      }
    });
    return Array.from(buckets.entries()).map(([label, count]) => ({ label, count }));
  })();

  // Top organizations (by total activity: docs + conversations + procedures)
  const { data: allOrgs } = await supabase.from("organizations").select("id, name");
  const { data: allMembers } = await supabase.from("organization_members").select("organization_id, user_id, role");
  const { data: allDocs } = await supabase.from("documents").select("organization_id");
  const { data: allConvs } = await supabase.from("conversations").select("organization_id");
  const { data: allProcs } = await supabase.from("procedures").select("organization_id");

  const orgMap = new Map<string, TopOrganization>();
  (allOrgs ?? []).forEach((org) => {
    orgMap.set(org.id, {
      id: org.id,
      name: org.name ?? "Unknown",
      memberCount: 0,
      documentCount: 0,
      conversationCount: 0,
      procedureCount: 0,
      plan: "trial",
    });
  });

  (allMembers ?? []).forEach((member) => {
    const org = orgMap.get(member.organization_id);
    if (org) {
      org.memberCount += 1;
      // Get plan from first COMPANY_ADMIN
      if (member.role === "COMPANY_ADMIN" && org.plan === "trial") {
        const user = usersData.users?.find((u) => u.id === member.user_id);
        if (user) {
          org.plan = ((user.user_metadata as { plan?: { id?: string } } | null)?.plan?.id ?? "trial") as string;
        }
      }
    }
  });

  (allDocs ?? []).forEach((doc) => {
    const org = orgMap.get(doc.organization_id);
    if (org) org.documentCount += 1;
  });

  (allConvs ?? []).forEach((conv) => {
    const org = orgMap.get(conv.organization_id);
    if (org) org.conversationCount += 1;
  });

  (allProcs ?? []).forEach((proc) => {
    const org = orgMap.get(proc.organization_id);
    if (org) org.procedureCount += 1;
  });

  const topOrganizations = Array.from(orgMap.values())
    .sort((a, b) => {
      const scoreA = a.documentCount + a.conversationCount + a.procedureCount;
      const scoreB = b.documentCount + b.conversationCount + b.procedureCount;
      return scoreB - scoreA;
    })
    .slice(0, 10);

  // Engagement metrics
  const orgCount = organizationsTotal || 1; // Avoid division by zero
  const avgDocsPerOrg = Math.round((documentsTotal / orgCount) * 10) / 10;
  const avgChatsPerOrg = Math.round((conversationsTotal / orgCount) * 10) / 10;
  const avgSopsPerOrg = Math.round((proceduresTotal / orgCount) * 10) / 10;
  const avgMembersPerOrg = Math.round((membersTotal / orgCount) * 10) / 10;

  // Active users (users who created conversations or procedures in last 7/30 days)
  const since7d = new Date();
  since7d.setDate(since7d.getDate() - 7);
  const since7dIso = since7d.toISOString();
  const since30dIso = since30d.toISOString();

  const { data: activeConvs7d } = await supabase
    .from("conversations")
    .select("user_id")
    .gte("created_at", since7dIso);
  const { data: activeProcs7d } = await supabase
    .from("procedures")
    .select("created_by")
    .gte("created_at", since7dIso);
  const { data: activeConvs30d } = await supabase
    .from("conversations")
    .select("user_id")
    .gte("created_at", since30dIso);
  const { data: activeProcs30d } = await supabase
    .from("procedures")
    .select("created_by")
    .gte("created_at", since30dIso);

  const activeUserIds7d = new Set<string>();
  (activeConvs7d ?? []).forEach((c) => activeUserIds7d.add(c.user_id));
  (activeProcs7d ?? []).forEach((p) => {
    if ((p as { created_by?: string }).created_by) {
      activeUserIds7d.add((p as { created_by: string }).created_by);
    }
  });

  const activeUserIds30d = new Set<string>();
  (activeConvs30d ?? []).forEach((c) => activeUserIds30d.add(c.user_id));
  (activeProcs30d ?? []).forEach((p) => {
    if ((p as { created_by?: string }).created_by) {
      activeUserIds30d.add((p as { created_by: string }).created_by);
    }
  });

  const engagementMetrics: EngagementMetrics = {
    avgDocsPerOrg,
    avgChatsPerOrg,
    avgSopsPerOrg,
    avgMembersPerOrg,
    activeUsers7d: activeUserIds7d.size,
    activeUsers30d: activeUserIds30d.size,
  };

  return {
    usersTotal,
    bannedUsers,
    organizationsTotal,
    membersTotal,
    documentsTotal,
    conversationsTotal,
    proceduresTotal,
    documentsByStatus,
    conversations7d,
    procedures7d,
    planDistribution,
    userGrowth30d,
    topOrganizations,
    engagementMetrics,
  };
};

/**
 * Get public statistics for landing page (lightweight, cacheable)
 * Returns total counts without sensitive data
 */
export async function getPublicStats(): Promise<{
  documentsTotal: number;
  conversationsTotal: number;
  proceduresTotal: number;
}> {
  try {
    const [documentsTotal, conversationsTotal, proceduresTotal] = await Promise.all([
      countTable("documents"),
      countTable("conversations"),
      countTable("procedures"),
    ]);

    return {
      documentsTotal,
      conversationsTotal,
      proceduresTotal,
    };
  } catch (error) {
    logError("getPublicStats failed", { error: error instanceof Error ? error.message : "Unknown error" });
    // Return fallback values on error
    return {
      documentsTotal: 0,
      conversationsTotal: 0,
      proceduresTotal: 0,
    };
  }
}

export type { PlatformStats, PlanDistribution, TopOrganization, EngagementMetrics };
export { getPlatformStats };

