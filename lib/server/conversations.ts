// lib/server/conversations.ts
import { createSupabaseServiceClient } from "./supabaseService";
import { getOrganizationPlanId, getPlanLimits } from "./subscriptions";

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

  // Check plan limits for conversations before creating a new one
  const planId = await getOrganizationPlanId(organizationId);
  const limits = getPlanLimits(planId);
  
  const { count: conversationsCount } = await supabase
    .from("conversations")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId);
  
  if ((conversationsCount ?? 0) >= limits.maxConversations) {
    throw new Error(`Conversation limit reached (${limits.maxConversations}). Please upgrade your plan or delete old conversations.`);
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

