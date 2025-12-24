import { createSupabaseServiceClient } from "@/lib/server/supabaseService";
import { logError } from "@/lib/server/logger";

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
  };
};

export type { PlatformStats };
export { getPlatformStats };

