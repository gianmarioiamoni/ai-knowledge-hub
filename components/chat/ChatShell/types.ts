export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
};

export type Conversation = {
  id: string;
  title: string;
  created_at: string;
};

export type ContextChunk = {
  id: string;
  chunk_text: string;
  chunk_metadata?: Record<string, unknown>;
};

export type ChatLabels = {
  placeholder: string;
  send: string;
  sending: string;
  stop: string;
  newChat: string;
  empty: string;
  loading: string;
  retry: string;
  contextTitle: string;
  contextEmpty: string;
  streaming: string;
};

