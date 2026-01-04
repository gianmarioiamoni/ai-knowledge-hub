export type DashboardStat = {
  label: string;
  value: string;
  delta: string;
};

export type PipelineStep = {
  title: string;
  desc: string;
};

export type DashboardLabels = {
  title: string;
  headline: string;
  subtitle: string;
  greetingPrefix: string;
  email: string;
  profileTooltip: string;
  logout: string;
  tenant: string;
  pgvector: string;
  sop: string;
  quickActions: string;
  quickActionsUpload: string;
  quickActionsChat: string;
  quickActionsSop: string;
  pipelineTitle: string;
  pipelineDesc: string;
  recommended: string;
  recommendedDesc: string;
  kpiTitle: string;
  kpiDesc: string;
  ingestionTitle: string;
  ingestionIngested: string;
  ingestionProcessing: string;
  ingestionLastIngested: string;
  ingestionNotAvailable: string;
  integrity: string;
  synced: string;
};

export type SuperAdminLabels = {
  title: string;
  subtitle: string;
  email: string;
  role: string;
  status: string;
  created: string;
  actions: string;
  loading: string;
  refresh: string;
  promote: string;
  demote: string;
  disable: string;
  enable: string;
  delete: string;
  banned: string;
  active: string;
  error: string;
  ok: string;
  cancel: string;
  deleteUserTitle: string;
  deleteUserDesc: string;
};

export type IngestionData = {
  ingestedCount: number;
  processingCount: number;
  lastIngestedAt?: string | null;
};

