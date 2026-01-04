import type { User } from "@supabase/supabase-js";

type UserRole = "SUPER_ADMIN" | "COMPANY_ADMIN" | "CONTRIBUTOR" | "VIEWER" | undefined | null;

const getUserRole = (user: User): UserRole => {
  return (user.user_metadata as { role?: string } | null)?.role as UserRole;
};

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
const canUseChat = (role: UserRole): boolean => isSuperAdmin(role) || isCompanyAdmin(role) || isContributor(role) || isViewer(role);
const canSeePlans = (role: UserRole): boolean => isSuperAdmin(role) || isCompanyAdmin(role);

export {
  getUserRole,
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
  canUseChat,
  canSeePlans,
};
export type { UserRole };


