export type PlanDistribution = {
  trial: number;
  demo: number;
  smb: number;
  enterprise: number;
  expired: number;
  none: number;
};

export type TopOrganization = {
  id: string;
  name: string;
  memberCount: number;
  documentCount: number;
  conversationCount: number;
  procedureCount: number;
  plan: string;
};

export type EngagementMetrics = {
  avgDocsPerOrg: number;
  avgChatsPerOrg: number;
  avgSopsPerOrg: number;
  avgMembersPerOrg: number;
  activeUsers7d: number;
  activeUsers30d: number;
};

export type PlatformStats = {
  usersTotal: number;
  bannedUsers: number;
  organizationsTotal: number;
  membersTotal: number;
  documentsTotal: number;
  proceduresTotal: number;
  conversationsTotal: number;
  documentsByStatus: Record<string, number>;
  conversations7d: Array<{ label: string; count: number }>;
  procedures7d: Array<{ label: string; count: number }>;
  planDistribution: PlanDistribution;
  userGrowth30d: Array<{ label: string; count: number }>;
  topOrganizations: TopOrganization[];
  engagementMetrics: EngagementMetrics;
};

export type AdminStatsLabels = {
  title: string;
  subtitle: string;
  description: string;
  users: string;
  orgs: string;
  documents: string;
  conversations: string;
  banned: string;
  members: string;
  procedures: string;
  docsByStatus: string;
  conversations7d: string;
  procedures7d: string;
  noData: string;
  planDistribution: string;
  userGrowth30d: string;
  topOrganizations: string;
  engagement: string;
  avgDocsPerOrg: string;
  avgChatsPerOrg: string;
  avgSopsPerOrg: string;
  avgMembersPerOrg: string;
  activeUsers7d: string;
  activeUsers30d: string;
  orgName: string;
  docs: string;
  chats: string;
  sops: string;
  plan: string;
  total: string;
};

