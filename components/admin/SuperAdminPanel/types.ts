type AdminUserRow = {
  id: string;
  email: string | null;
  role: string | null;
  banned: boolean;
  createdAt: string | null;
  statusLabel?: string;
};

type SuperAdminLabels = {
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
  cancel?: string;
};

type SuperAdminPanelProps = {
  labels: SuperAdminLabels;
};

export type { AdminUserRow, SuperAdminLabels, SuperAdminPanelProps };

