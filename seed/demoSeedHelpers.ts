// seed/demoSeedHelpers.ts
import { createSupabaseServiceClient } from "@/lib/server/supabaseService";
import { DEMO_ORG_NAME } from "@/lib/server/demoUsers";

/**
 * Get demo organization ID
 */
export async function getDemoOrgId(): Promise<string | null> {
  const service = createSupabaseServiceClient();
  const { data, error } = await service
    .from("organizations")
    .select("id")
    .eq("name", DEMO_ORG_NAME)
    .single();

  if (error) {
    console.error("[getDemoOrgId] Error:", error);
    return null;
  }
  return data?.id ?? null;
}

/**
 * Get demo user IDs by email
 * Returns a map of email -> user_id
 */
export async function getDemoUserIds(): Promise<Record<string, string>> {
  const orgId = await getDemoOrgId();
  if (!orgId) return {};

  const service = createSupabaseServiceClient();
  const { data: members, error } = await service
    .from("organization_members")
    .select("user_id")
    .eq("organization_id", orgId);

  if (error || !members) {
    console.error("[getDemoUserIds] Error:", error);
    return {};
  }

  // Get user emails from auth
  const { data: usersData } = await service.auth.admin.listUsers();
  if (!usersData?.users) return {};

  const userIdToEmail: Record<string, string> = {};
  for (const user of usersData.users) {
    const isDemoUser = (user.user_metadata as { is_demo_user?: boolean } | null)?.is_demo_user ?? false;
    if (isDemoUser && user.email) {
      userIdToEmail[user.email] = user.id;
    }
  }

  return userIdToEmail;
}

/**
 * Simple text chunker (splits by paragraphs, max size)
 */
export function chunkText(text: string, maxSize = 1000, overlap = 200): string[] {
  const paragraphs = text.split(/\n\n+/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const para of paragraphs) {
    if (currentChunk.length + para.length > maxSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      // Add overlap
      const words = currentChunk.split(" ");
      currentChunk = words.slice(-Math.floor(overlap / 5)).join(" ") + "\n\n" + para;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + para;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Generate a mock embedding (1536 dimensions, all zeros)
 * In production, this would call OpenAI embeddings API
 */
export function generateMockEmbedding(): number[] {
  return new Array(1536).fill(0);
}

/**
 * Format embedding array for PostgreSQL vector type
 */
export function formatEmbeddingForPg(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
