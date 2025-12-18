// lib/server/rag.ts
import { createEmbeddingModel } from "./langchain";
import { createSupabaseServiceClient } from "./supabaseService";

export type RetrievedChunk = {
  id: string;
  document_id: string;
  chunk_text: string;
  chunk_metadata: Record<string, unknown>;
  similarity: number;
};

export const embedQuery = async (query: string): Promise<number[]> => {
  const embedder = createEmbeddingModel();
  return embedder.embedQuery(query);
};

export const searchSimilarChunks = async (
  organizationId: string,
  embedding: number[],
  topK = 6
): Promise<RetrievedChunk[]> => {
  const supabase = createSupabaseServiceClient();

  const { data, error } = await supabase.rpc("match_document_chunks", {
    query_embedding: embedding,
    match_count: topK,
    org_id: organizationId,
    similarity_threshold: 0.75,
  });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as RetrievedChunk[];
};

