export type OrgRow = {
  id: string;
  name: string;
  disabled: boolean;
};

export type MemberRow = {
  user_id: string;
  organization_id: string;
  role: string;
  disabled: boolean;
  email: string | null;
  created_at: string | null;
  is_demo_user: boolean;
};

export type SuperAdminLabels = {
  title: string;
  subtitle: string;
  description: string;
  orgsTitle: string;
  usersTitle: string;
  empty: string;
  status: {
    active: string;
    disabled: string;
  };
  users: {
    email: string;
    org: string;
    role: string;
    status: string;
    actions: string;
  };
  actions: {
    enable: string;
    disable: string;
    delete: string;
    cancel: string;
    disableOrgTitle: string;
    disableOrgDesc: string;
    deleteOrgTitle: string;
    deleteOrgDesc: string;
    disableUserTitle: string;
    disableUserDesc: string;
    deleteUserTitle: string;
    deleteUserDesc: string;
  };
};

