import { NextResponse } from "next/server";
import { z } from "zod";
import { listMessages } from "@/lib/server/chat";
import { createSupabaseServiceClient } from "@/lib/server/supabaseService";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import { rateLimit } from "@/lib/server/rateLimit";
import { logError } from "@/lib/server/logger";

const schema = z.object({
  conversationId: z.string().uuid(),
});

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const conversationId = url.searchParams.get("conversationId");
  const parsed = schema.safeParse({ conversationId });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid conversationId" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient(false);
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = rateLimit(`chat-msg:${userData.user.id}`, { limit: 60, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": Math.ceil((rl.resetAt - Date.now()) / 1000).toString() } }
    );
  }

  const service = createSupabaseServiceClient();
  const { data: conv, error: convError } = await service
    .from("conversations")
    .select("id, organization_id")
    .eq("id", parsed.data.conversationId)
    .maybeSingle();

  if (convError || !conv) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const { data: membership } = await service
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userData.user.id)
    .eq("organization_id", conv.organization_id)
    .limit(1)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const messages = await listMessages(parsed.data.conversationId);
    return NextResponse.json({ messages });
  } catch (err) {
    logError("List messages failed", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
  }
}

