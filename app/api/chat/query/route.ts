import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureConversation, insertMessage } from "@/lib/server/conversations";
import { createSupabaseServiceClient } from "@/lib/server/supabaseService";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import { embedQuery, searchSimilarChunks } from "@/lib/server/rag";
import { createChatModel } from "@/lib/server/langchain";
import { buildPrompt, encodeLine } from "@/lib/server/ragPrompt";
import { rateLimit } from "@/lib/server/rateLimit";
import { logError } from "@/lib/server/logger";

const bodySchema = z.object({
  query: z.string().min(4, "Query too short").max(1000, "Query too long"),
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

  const rl = rateLimit(`chat:${userData.user.id}`, { limit: 20, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": Math.ceil((rl.resetAt - Date.now()) / 1000).toString() } }
    );
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

  await insertMessage({
    conversationId,
    role: "user",
    content: parsed.data.query,
  });

  const meta = {
    type: "meta" as const,
    conversationId,
    chunks: chunks.slice(0, 3).map((c) => ({
      id: c.id,
      chunk_text: c.chunk_text,
      chunk_metadata: c.chunk_metadata,
    })),
  };

  const stream = await createAnswerStream({
    query: parsed.data.query,
    chunks,
    conversationId,
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-store",
    },
  });
}

type StreamParams = {
  query: string;
  chunks: Awaited<ReturnType<typeof searchSimilarChunks>>;
  conversationId: string;
};

const createAnswerStream = async ({ query, chunks, conversationId }: StreamParams) => {
  const context = chunks.map((c, idx) => `(${idx + 1}) ${c.chunk_text}`).join("\n\n");
  const prompt = buildPrompt(query, context);
  const llm = createChatModel();
  const stream = await llm.stream([{ role: "user", content: prompt }]);

  const meta = {
    type: "meta" as const,
    conversationId,
    chunks: chunks.slice(0, 3).map((c) => ({
      id: c.id,
      chunk_text: c.chunk_text,
      chunk_metadata: c.chunk_metadata,
    })),
  };

  let fullAnswer = "";

  const readable = new ReadableStream({
    async start(controller) {
      controller.enqueue(encodeLine(meta));
      try {
        for await (const chunk of stream) {
          const token = chunk.content?.toString() ?? "";
          if (!token) continue;
          fullAnswer += token;
          controller.enqueue(encodeLine({ type: "token", data: token }));
        }
        controller.enqueue(encodeLine({ type: "done" }));
        controller.close();
        await insertMessage({
          conversationId,
          role: "assistant",
          content: fullAnswer,
          metadata: { chunks: chunks.slice(0, 3).map((c) => c.id) },
        });
      } catch (err) {
        logError("Chat stream failed", { error: err instanceof Error ? err.message : String(err) });
        controller.enqueue(
          encodeLine({ type: "error", error: err instanceof Error ? err.message : "Stream error" })
        );
        controller.close();
      }
    },
  });

  return readable;
};

