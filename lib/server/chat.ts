// lib/server/chat.ts
import { createSupabaseServiceClient } from "./supabaseService";

export type Conversation = {
  id: string;
  title: string;
  created_at: string;
};

export type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
};

export const listConversations = async (organizationId: string, userId: string): Promise<Conversation[]> => {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("conversations")
    .select("id,title,created_at")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw new Error(error.message);
  return (data ?? []) as Conversation[];
};

export const listMessages = async (conversationId: string): Promise<Message[]> => {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("messages")
    .select("id,role,content,created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(50);
  if (error) throw new Error(error.message);
  return (data ?? []) as Message[];
};

