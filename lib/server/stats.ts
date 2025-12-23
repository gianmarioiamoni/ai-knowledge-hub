// lib/server/stats.ts
import { createSupabaseServiceClient } from "./supabaseService";
import type { IngestionStats } from "./documents";

type DashboardStats = {
  documents: number;
  conversations: number;
  procedures: number;
  members: number;
  ingestion: IngestionStats;
};

const getCount = async (
  supabase: ReturnType<typeof createSupabaseServiceClient>,
  table: string,
  organizationId: string
): Promise<number> => {
  const { count } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId);
  return count ?? 0;
};

const getDashboardStats = async (
  organizationId: string,
  ingestion: IngestionStats
): Promise<DashboardStats> => {
  const supabase = createSupabaseServiceClient();

  const [documents, conversations, procedures, members] = await Promise.all([
    getCount(supabase, "documents", organizationId),
    getCount(supabase, "conversations", organizationId),
    getCount(supabase, "procedures", organizationId),
    getCount(supabase, "organization_members", organizationId),
  ]);

  return {
    documents,
    conversations,
    procedures,
    members,
    ingestion,
  };
};

export type { DashboardStats };
export { getDashboardStats };

