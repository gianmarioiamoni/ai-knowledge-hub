export type InviteRow = {
  id: string;
  email: string;
  role: string;
  status: string;
  expires_at: string | null;
  created_at: string | null;
};

export type UserRow = {
  id: string;
  email: string | null;
  role: string | null;
  disabled: boolean;
  created_at: string | null;
};

export type AdminLabels = {
  title: string;
  invitesTitle: string;
  invitesSubtitle: string;
  usersTitle: string;
  usersSubtitle: string;
  filterAll: string;
  filterPending: string;
  filterAccepted: string;
  filterExpired: string;
  filterRevoked: string;
  revoke: string;
  deleteInvite: string;
  deleteAllInvites: string;
  invitesEmpty?: string;
  inviteFormTitle: string;
  inviteFormEmail: string;
  inviteFormRole: string;
  inviteFormRoleContributor: string;
  inviteFormRoleViewer: string;
  inviteFormSubmit: string;
  inviteFormSuccess: string;
  roles: {
    company: string;
    contributor: string;
    viewer: string;
    COMPANY_ADMIN: string;
    CONTRIBUTOR: string;
    VIEWER: string;
  };
  headers: {
    email: string;
    role: string;
    status: string;
    expires: string;
    created: string;
    actions: string;
  };
  statusActive: string;
  statusSuspended: string;
  suspend: string;
  enable: string;
  deleteUser: string;
  changeRole: string;
  usersEmpty?: string;
  deleteUserConfirmTitle: string;
  deleteUserConfirmDescription: string;
  deleteUserConfirmButton: string;
  cancel: string;
};

