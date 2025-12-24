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

  return {
    usersTotal,
    bannedUsers,
    organizationsTotal,
    membersTotal,
    documentsTotal,
    conversationsTotal,
    proceduresTotal,
  };
};

export type { PlatformStats };
export { getPlatformStats };

