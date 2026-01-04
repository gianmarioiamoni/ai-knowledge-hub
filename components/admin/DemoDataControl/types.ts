// components/admin/DemoDataControl/types.ts
export type DemoDataControlLabels = {
  title: string;
  description: string;
  statusActive: string;
  statusNotSeeded: string;
  documents: string;
  conversations: string;
  procedures: string;
  chunks: string;
  messages: string;
  seedButton: string;
  resetButton: string;
  resetTitle: string;
  resetDescription: string;
  resetConfirm: string;
  cancel: string;
  seeding: string;
  resetting: string;
  seedSuccess: string;
  seedError: string;
  resetSuccess: string;
  resetError: string;
};

export type DemoDataStatus = {
  hasData: boolean;
  documentCount: number;
  conversationCount: number;
  procedureCount: number;
  chunkCount: number;
  messageCount: number;
};

