"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import { createSupabaseServiceClient } from "@/lib/server/supabaseService";
import { setUserBan, deleteUserWithCascade } from "@/lib/server/adminUsers";
import { isDemoUser } from "@/lib/server/demoUsers";

type ActionResult = { error?: string; success?: string };

const userSchema = z.object({
  locale: z.string().min(2),
  userId: z.string().uuid(),
});

const orgSchema = z.object({
  locale: z.string().min(2),
  orgId: z.string().uuid(),
});

const ensureSuper = async (locale: string) => {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user || (data.user.user_metadata as { role?: string } | null)?.role !== "SUPER_ADMIN") {
    redirect(`/${locale}/dashboard`);
  }
};

export const disableUser = async (_: ActionResult, formData: FormData): Promise<ActionResult> => {
  const parsed = userSchema.safeParse({
    locale: formData.get("locale"),
    userId: formData.get("userId"),
  });
  if (!parsed.success) return { error: "Invalid data" };
  await ensureSuper(parsed.data.locale);

  const service = createSupabaseServiceClient();
  await service.from("organization_members").update({ disabled: true }).eq("user_id", parsed.data.userId);
  await setUserBan(parsed.data.userId, true);
  return { success: "ok" };
};

export const enableUser = async (_: ActionResult, formData: FormData): Promise<ActionResult> => {
  const parsed = userSchema.safeParse({
    locale: formData.get("locale"),
    userId: formData.get("userId"),
  });
  if (!parsed.success) return { error: "Invalid data" };
  await ensureSuper(parsed.data.locale);

  const service = createSupabaseServiceClient();
  await service.from("organization_members").update({ disabled: false }).eq("user_id", parsed.data.userId);
  await setUserBan(parsed.data.userId, false);
  return { success: "ok" };
};

export const deleteUser = async (_: ActionResult, formData: FormData): Promise<ActionResult> => {
  const parsed = userSchema.safeParse({
    locale: formData.get("locale"),
    userId: formData.get("userId"),
  });
  if (!parsed.success) return { error: "Invalid data" };
  await ensureSuper(parsed.data.locale);

  // Check if it's a demo user by fetching user data
  const service = createSupabaseServiceClient();
  const { data: userData } = await service.auth.admin.getUserById(parsed.data.userId);
  
  if (userData?.user && isDemoUser(userData.user.email)) {
    return { error: "Demo users cannot be deleted" };
  }

  await deleteUserWithCascade(parsed.data.userId);
  return { success: "ok" };
};

export const disableOrg = async (_: ActionResult, formData: FormData): Promise<ActionResult> => {
  const parsed = orgSchema.safeParse({
    locale: formData.get("locale"),
    orgId: formData.get("orgId"),
  });
  if (!parsed.success) return { error: "Invalid data" };
  await ensureSuper(parsed.data.locale);

  const service = createSupabaseServiceClient();
  await service.from("organizations").update({ disabled: true }).eq("id", parsed.data.orgId);
  await service.from("organization_members").update({ disabled: true }).eq("organization_id", parsed.data.orgId);
  return { success: "ok" };
};

export const enableOrg = async (_: ActionResult, formData: FormData): Promise<ActionResult> => {
  const parsed = orgSchema.safeParse({
    locale: formData.get("locale"),
    orgId: formData.get("orgId"),
  });
  if (!parsed.success) return { error: "Invalid data" };
  await ensureSuper(parsed.data.locale);

  const service = createSupabaseServiceClient();
  await service.from("organizations").update({ disabled: false }).eq("id", parsed.data.orgId);
  await service.from("organization_members").update({ disabled: false }).eq("organization_id", parsed.data.orgId);
  return { success: "ok" };
};

export const deleteOrg = async (_: ActionResult, formData: FormData): Promise<ActionResult> => {
  const parsed = orgSchema.safeParse({
    locale: formData.get("locale"),
    orgId: formData.get("orgId"),
  });
  if (!parsed.success) return { error: "Invalid data" };
  await ensureSuper(parsed.data.locale);

  const service = createSupabaseServiceClient();
  const { error } = await service.from("organizations").delete().eq("id", parsed.data.orgId);
  if (error) return { error: error.message };
  return { success: "ok" };
};


