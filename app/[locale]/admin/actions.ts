"use server";

import { redirect } from "next/navigation";
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
  if (error || !data.user) redirect({ href: "/login", locale });
  const { role } = await requireActiveOrganization({ supabase, locale });
  if (!canManageOrg(role as any)) redirect({ href: "/dashboard", locale });
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
}: {
  organizationId: string;
}): Promise<
  { id: string; email: string | null; role: string | null; disabled: boolean; created_at: string | null }[]
> => {
  const service = createSupabaseServiceClient();
  const { data } = await service
    .from("organization_members")
    .select("user_id, role, disabled, created_at, users(email, created_at)")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });
  return (
    data?.map((row) => ({
      id: row.user_id,
      email: (row as any).users?.email ?? null,
      role: row.role ?? null,
      disabled: row.disabled ?? false,
      created_at: row.created_at ?? null,
    })) ?? []
  );
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
  return { success: "ok" };
};


