import { NextResponse } from "next/server";
import { z } from "zod";
import { listMessages } from "@/lib/server/chat";
import { createSupabaseServiceClient } from "@/lib/server/supabaseService";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";

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

  const messages = await listMessages(parsed.data.conversationId);
  return NextResponse.json({ messages });
}

