import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureConversation, insertMessage } from "@/lib/server/conversations";
import { createSupabaseServiceClient } from "@/lib/server/supabaseService";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import { embedQuery, searchSimilarChunks } from "@/lib/server/rag";
import { createChatModel } from "@/lib/server/langchain";

const bodySchema = z.object({
  query: z.string().min(4, "Query too short"),
  conversationId: z.string().uuid().optional(),
});

export async function POST(request: Request): Promise<NextResponse> {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  const supabase = createSupabaseServerClient(false);
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = createSupabaseServiceClient();
  const { data: membership } = await service
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userData.user.id)
    .limit(1)
    .maybeSingle();

  if (!membership?.organization_id) {
    return NextResponse.json({ error: "No organization found" }, { status: 403 });
  }

  const embedding = await embedQuery(parsed.data.query);
  const chunks = await searchSimilarChunks(membership.organization_id, embedding, 6);

  const conversationId = await ensureConversation({
    conversationId: parsed.data.conversationId,
    organizationId: membership.organization_id,
    userId: userData.user.id,
    title: parsed.data.query.slice(0, 80),
  });

  const context = chunks.map((c, idx) => `(${idx + 1}) ${c.chunk_text}`).join("\n\n");
  const prompt = buildPrompt(parsed.data.query, context);

  const llm = createChatModel();
  const result = await llm.invoke([{ role: "user", content: prompt }]);
  const answer = result.content?.toString() ?? "";

  await insertMessage({
    conversationId,
    role: "user",
    content: parsed.data.query,
  });

  await insertMessage({
    conversationId,
    role: "assistant",
    content: answer,
    metadata: { chunks: chunks.slice(0, 3).map((c) => c.id) },
  });

  return NextResponse.json({ conversationId, answer, chunks });
}

const buildPrompt = (question: string, context: string): string => {
  return [
    "You are a concise assistant. Answer based only on the provided context.",
    "If the answer is not present, say you don't have enough information.",
    "",
    "Context:",
    context,
    "",
    "Question:",
    question,
  ].join("\n");
};

