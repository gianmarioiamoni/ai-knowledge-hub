export type OrgRow = {
  id: string;
  name: string;
  disabled: boolean;
  plan_id: string;
  member_count: number;
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

export type CompanyGroup = {
  org: OrgRow;
  members: MemberRow[];
};

export type SuperAdminLabels = {
  title: string;
  subtitle: string;
  description: string;
  logout: string;
  orgsTitle: string;
  usersTitle: string;
  empty: string;
  filters: {
    all: string;
    company: string;
    status: string;
    plan: string;
    role: string;
    showDemo: string;
    search: string;
  };
  status: {
    active: string;
    disabled: string;
  };
  plans: {
    trial: string;
    demo: string;
    smb: string;
    enterprise: string;
    expired: string;
  };
  users: {
    email: string;
    org: string;
    role: string;
    status: string;
    actions: string;
    count: string;
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
    deleteOrgWarning: string;
    disableUserTitle: string;
    disableUserDesc: string;
    deleteUserTitle: string;
    deleteUserDesc: string;
  };
  demoData: {
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
};

