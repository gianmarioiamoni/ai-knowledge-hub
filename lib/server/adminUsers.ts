import type { User } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { logError, logInfo } from "@/lib/server/logger";
import { createSupabaseServiceClient } from "@/lib/server/supabaseService";

type AdminUser = {
  id: string;
  email: string | null;
  role: string | null;
  banned: boolean;
  createdAt: string | null;
};

const listAllUsers = async (): Promise<AdminUser[]> => {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    logError("admin.listUsers failed", { error: error.message });
    throw error;
  }
  return (data?.users ?? []).map((u) => ({
    id: u.id,
    email: u.email ?? null,
    role: (u.user_metadata as { role?: string } | null)?.role ?? null,
    banned: Boolean((u as { banned_until?: string | null }).banned_until),
    createdAt: u.created_at ?? null,
  }));
};

const updateUserRole = async (userId: string, role: string | null): Promise<User> => {
  const supabase = createSupabaseServiceClient();
  const payload = role
    ? { user_metadata: { role }, app_metadata: { role } }
    : { user_metadata: { role: null }, app_metadata: { role: null } };

  const { data, error } = await supabase.auth.admin.updateUserById(userId, payload);
  if (error || !data.user) {
    logError("admin.updateUserById failed", { error: error?.message, userId });
    throw error ?? new Error("Failed to update user");
  }
  return data.user;
};

const setUserBan = async (userId: string, banned: boolean): Promise<void> => {
  const supabase = createSupabaseServiceClient();
  const ban_duration = banned ? "87600h" : "none"; // ~10 years or remove ban
  // ban_duration is supported by GoTrue but not typed in supabase-js
  const { error } = await supabase.auth.admin.updateUserById(userId, { ban_duration } as Record<string, unknown>);
  if (error) {
    logError("admin.banUser failed", { error: error.message, userId });
    throw error;
  }
};

const deleteUserWithCascade = async (userId: string): Promise<void> => {
  const supabase = createSupabaseServiceClient();

  // Find organizations where the user is member
  const { data: memberships, error: membershipsError } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId);

  if (membershipsError) {
    logError("admin.fetchMemberships failed", { error: membershipsError.message, userId });
    throw membershipsError;
  }

  // For orgs where the user is the only member, delete the org (cascade documents, chunks, conversations, procedures)
  for (const membership of memberships ?? []) {
    const orgId = membership.organization_id as string;
    const { data: others } = await supabase
      .from("organization_members")
      .select("user_id")
      .eq("organization_id", orgId);

    if ((others?.length ?? 0) <= 1) {
      const { error: deleteOrgError } = await supabase.from("organizations").delete().eq("id", orgId);
      if (deleteOrgError) {
        logError("admin.deleteOrg failed", { error: deleteOrgError.message, orgId, userId });
        throw deleteOrgError;
      }
    }
  }

  // Delete user's conversations explicitly (safety)
  const { error: deleteConversations } = await supabase.from("conversations").delete().eq("user_id", userId);
  if (deleteConversations) {
    logError("admin.deleteConversations failed", { error: deleteConversations.message, userId });
    throw deleteConversations;
  }

  // Finally delete user from auth
  const { error: deleteAuth } = await supabase.auth.admin.deleteUser(userId);
  if (deleteAuth) {
    logError("admin.deleteUser failed", { error: deleteAuth.message, userId });
    throw deleteAuth;
  }

  logInfo("User deleted with cascade", { userId });
};

export { listAllUsers, updateUserRole, setUserBan, deleteUserWithCascade };

