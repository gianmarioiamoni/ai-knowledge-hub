// lib/server/conversations.ts
import { createSupabaseServiceClient } from "./supabaseService";

type EnsureConversationParams = {
  conversationId?: string;
  organizationId: string;
  userId: string;
  title?: string;
};

export const ensureConversation = async ({
  conversationId,
  organizationId,
  userId,
  title,
}: EnsureConversationParams): Promise<string> => {
  const supabase = createSupabaseServiceClient();

  if (conversationId) {
    const { data, error } = await supabase
      .from("conversations")
      .select("id, organization_id")
      .eq("id", conversationId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (error || !data) {
      throw new Error("Conversation not found for this organization");
    }
    return data.id;
  }

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      organization_id: organizationId,
      user_id: userId,
      title: title || "Conversation",
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new Error(error?.message ?? "Unable to create conversation");
  }

  return data.id;
};

type InsertMessageParams = {
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata?: Record<string, unknown>;
};

export const insertMessage = async ({
  conversationId,
  role,
  content,
  metadata,
}: InsertMessageParams): Promise<void> => {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    role,
    content,
    metadata: metadata ?? {},
  });
  if (error) {
    throw new Error(error.message);
  }
};

