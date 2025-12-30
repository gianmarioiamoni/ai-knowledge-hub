type UserRole = "SUPER_ADMIN" | "COMPANY_ADMIN" | "CONTRIBUTOR" | "VIEWER" | undefined | null;

const isSuperAdmin = (role: UserRole): boolean => role === "SUPER_ADMIN";
const isCompanyAdmin = (role: UserRole): boolean => role === "COMPANY_ADMIN";
const isContributor = (role: UserRole): boolean => role === "CONTRIBUTOR";
const isViewer = (role: UserRole): boolean => role === "VIEWER";

const canUploadDocs = (role: UserRole): boolean => isSuperAdmin(role) || isCompanyAdmin(role) || isContributor(role);
const canGenerateSop = canUploadDocs;
const canInviteUsers = (role: UserRole): boolean => isSuperAdmin(role) || isCompanyAdmin(role);
const canManageUsers = canInviteUsers;
const canManageOrg = canInviteUsers;
const canViewAllOrgs = (role: UserRole): boolean => isSuperAdmin(role);

export {
  isSuperAdmin,
  isCompanyAdmin,
  isContributor,
  isViewer,
  canUploadDocs,
  canGenerateSop,
  canInviteUsers,
  canManageUsers,
  canManageOrg,
  canViewAllOrgs,
};
export type { UserRole };


