// lib/server/documents.ts
import { createSupabaseServiceClient } from "./supabaseService";

export type IngestionStats = {
  ingestedCount: number;
  processingCount: number;
  lastIngestedAt?: string;
};

export const getIngestionStats = async (organizationId: string): Promise<IngestionStats> => {
  const supabase = createSupabaseServiceClient();

  const [{ count: ingestedCount }, { count: processingCount }, last] = await Promise.all([
    supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("status", "ingested"),
    supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .in("status", ["pending", "processing"]),
    supabase
      .from("documents")
      .select("updated_at")
      .eq("organization_id", organizationId)
      .eq("status", "ingested")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    ingestedCount: ingestedCount ?? 0,
    processingCount: processingCount ?? 0,
    lastIngestedAt: last.data?.updated_at ?? undefined,
  };
};

