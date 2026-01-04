// seed/types.ts
export type SeedDocument = {
  title: string;
  fileName: string;
  fileType: string;
  textContent: string;
  metadata: Record<string, unknown>;
};

export type SeedMessage = {
  role: "user" | "assistant";
  content: string;
};

export type SeedConversation = {
  title: string;
  userEmail: string; // Which demo user created this
  messages: SeedMessage[];
};

export type SeedProcedure = {
  title: string;
  content: string;
  sourceDocuments: string[]; // Document titles referenced
};

export type SeedData = {
  documents: SeedDocument[];
  conversations: SeedConversation[];
  procedures: SeedProcedure[];
};

export type SeedResult = {
  success: boolean;
  documentsCreated: number;
  chunksCreated: number;
  conversationsCreated: number;
  messagesCreated: number;
  proceduresCreated: number;
  error?: string;
};

export type ResetResult = {
  success: boolean;
  deleted: {
    documents: number;
    chunks: number;
    conversations: number;
    messages: number;
    procedures: number;
  };
  recreated: SeedResult;
  error?: string;
};

export type DemoDataStatus = {
  hasData: boolean;
  documentCount: number;
  conversationCount: number;
  procedureCount: number;
  chunkCount: number;
  messageCount: number;
};

