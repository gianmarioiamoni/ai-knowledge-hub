"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import { createSupabaseServiceClient } from "@/lib/server/supabaseService";
import { requireActiveOrganization } from "@/lib/server/organizations";
import { canManageOrg } from "@/lib/server/roles";

type ActionResult = { error?: string; success?: string };

const userSchema = z.object({
  locale: z.string().min(2),
  userId: z.string().uuid(),
  role: z.enum(["COMPANY_ADMIN", "CONTRIBUTOR", "VIEWER"]).optional(),
});

const orgScopedSchema = z.object({
  locale: z.string().min(2),
  userId: z.string().uuid(),
});

const ensureCompanyAdmin = async (locale: string) => {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect(`/${locale}/login`);
  const { role } = await requireActiveOrganization({ supabase, locale });
  if (!canManageOrg(role as any)) redirect(`/${locale}/dashboard`);
  return { supabase, user: data.user };
};

const ensureAtLeastOneAdmin = async (organizationId: string, skipUserId?: string) => {
  const service = createSupabaseServiceClient();
  const { count } = await service
    .from("organization_members")
    .select("user_id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("role", "COMPANY_ADMIN")
    .neq("user_id", skipUserId ?? "");
  if ((count ?? 0) === 0) {
    return false;
  }
  return true;
};

export const listCompanyUsers = async ({
  organizationId,
  excludeUserId,
}: {
  organizationId: string;
  excludeUserId?: string;
}): Promise<
  { id: string; email: string | null; role: string | null; disabled: boolean; created_at: string | null }[]
> => {
  const service = createSupabaseServiceClient();
  
  // First query: get organization members
  let membersQuery = service
    .from("organization_members")
    .select("user_id, role, disabled, created_at")
    .eq("organization_id", organizationId);
  
  // Exclude the current user (usually the Company Admin viewing the page)
  if (excludeUserId) {
    membersQuery = membersQuery.neq("user_id", excludeUserId);
  }
  
  const { data: members, error: membersError } = await membersQuery.order("created_at", { ascending: false });
  
  if (membersError) {
    console.error("[listCompanyUsers] Error fetching members:", membersError);
    return [];
  }
  
  if (!members || members.length === 0) {
    console.log("[listCompanyUsers] No members found for organization:", organizationId);
    return [];
  }
  
  // Second query: get user details from auth.users using service role
  // We need to call admin API for this
  const userIds = members.map((m) => m.user_id);
  
  // Use admin.listUsers() to get email from auth.users
  const { data: authData, error: authError } = await service.auth.admin.listUsers({
    perPage: 1000, // Adjust if you have more users
  });
  
  if (authError) {
    console.error("[listCompanyUsers] Error fetching auth users:", authError);
    // Return members without email if we can't fetch auth data
    return members.map((member) => ({
      id: member.user_id,
      email: null,
      role: member.role ?? null,
      disabled: member.disabled ?? false,
      created_at: member.created_at ?? null,
    }));
  }
  
  // Create a map of user_id -> email
  const userEmailMap = new Map(
    authData.users
      .filter((u) => userIds.includes(u.id))
      .map((u) => [u.id, u.email])
  );
  
  const users = members.map((member) => ({
    id: member.user_id,
    email: userEmailMap.get(member.user_id) ?? null,
    role: member.role ?? null,
    disabled: member.disabled ?? false,
    created_at: member.created_at ?? null,
  }));
  
  console.log("[listCompanyUsers] Processed users:", JSON.stringify(users, null, 2));
  
  return users;
};

export const changeUserRole = async (_prev: ActionResult, formData: FormData): Promise<ActionResult> => {
  const parsed = userSchema.safeParse({
    locale: formData.get("locale"),
    userId: formData.get("userId"),
    role: formData.get("role"),
  });
  if (!parsed.success || !parsed.data.role) return { error: "Invalid data" };
  const { supabase, user } = await ensureCompanyAdmin(parsed.data.locale);
  const { organizationId } = await requireActiveOrganization({ supabase, locale: parsed.data.locale });
  if (user.id === parsed.data.userId && parsed.data.role !== "COMPANY_ADMIN") {
    return { error: "You cannot downgrade yourself" };
  }
  if (parsed.data.role !== "COMPANY_ADMIN") {
    const ok = await ensureAtLeastOneAdmin(organizationId, parsed.data.userId);
    if (!ok) return { error: "At least one Company Admin required" };
  }

  const service = createSupabaseServiceClient();
  const { error } = await service
    .from("organization_members")
    .update({ role: parsed.data.role })
    .eq("organization_id", organizationId)
    .eq("user_id", parsed.data.userId);
  if (error) return { error: error.message };
  
  // Revalidate the admin page to show updated data
  revalidatePath(`/${parsed.data.locale}/admin`);
  
  return { success: "ok" };
};

export const suspendUser = async (_prev: ActionResult, formData: FormData): Promise<ActionResult> => {
  const parsed = orgScopedSchema.safeParse({
    locale: formData.get("locale"),
    userId: formData.get("userId"),
  });
  if (!parsed.success) return { error: "Invalid data" };
  const { supabase, user } = await ensureCompanyAdmin(parsed.data.locale);
  const { organizationId } = await requireActiveOrganization({ supabase, locale: parsed.data.locale });
  if (user.id === parsed.data.userId) return { error: "You cannot suspend yourself" };

  const service = createSupabaseServiceClient();
  const { error } = await service
    .from("organization_members")
    .update({ disabled: true })
    .eq("organization_id", organizationId)
    .eq("user_id", parsed.data.userId);
  if (error) return { error: error.message };
  
  // Revalidate the admin page to show updated data
  revalidatePath(`/${parsed.data.locale}/admin`);
  
  return { success: "ok" };
};

export const enableUser = async (_prev: ActionResult, formData: FormData): Promise<ActionResult> => {
  const parsed = orgScopedSchema.safeParse({
    locale: formData.get("locale"),
    userId: formData.get("userId"),
  });
  if (!parsed.success) return { error: "Invalid data" };
  const { supabase } = await ensureCompanyAdmin(parsed.data.locale);
  const { organizationId } = await requireActiveOrganization({ supabase, locale: parsed.data.locale });

  const service = createSupabaseServiceClient();
  const { error } = await service
    .from("organization_members")
    .update({ disabled: false })
    .eq("organization_id", organizationId)
    .eq("user_id", parsed.data.userId);
  if (error) return { error: error.message };
  
  // Revalidate the admin page to show updated data
  revalidatePath(`/${parsed.data.locale}/admin`);
  
  return { success: "ok" };
};

export const deleteUserMembership = async (_prev: ActionResult, formData: FormData): Promise<ActionResult> => {
  const parsed = orgScopedSchema.safeParse({
    locale: formData.get("locale"),
    userId: formData.get("userId"),
  });
  if (!parsed.success) return { error: "Invalid data" };
  const { supabase, user } = await ensureCompanyAdmin(parsed.data.locale);
  const { organizationId } = await requireActiveOrganization({ supabase, locale: parsed.data.locale });
  if (user.id === parsed.data.userId) return { error: "You cannot delete yourself" };

  const service = createSupabaseServiceClient();
  const ok = await ensureAtLeastOneAdmin(organizationId, parsed.data.userId);
  if (!ok) return { error: "At least one Company Admin required" };

  const { error } = await service
    .from("organization_members")
    .delete()
    .eq("organization_id", organizationId)
    .eq("user_id", parsed.data.userId);
  if (error) return { error: error.message };
  
  // Revalidate the admin page to show updated data
  revalidatePath(`/${parsed.data.locale}/admin`);
  
  return { success: "ok" };
};


