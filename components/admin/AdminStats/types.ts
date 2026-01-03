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
};

