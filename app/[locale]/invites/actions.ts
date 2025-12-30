"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import { createSupabaseServiceClient } from "@/lib/server/supabaseService";
import { ensureUserOrganization } from "@/lib/server/organizations";
import { canInviteUsers } from "@/lib/server/roles";
import { sendInviteEmail } from "@/lib/server/email";
import { getOrganizationPlanId, getPlanLimits } from "@/lib/server/subscriptions";

type ActionResult = { error?: string; success?: string };

const createSchema = z.object({
  locale: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["CONTRIBUTOR", "VIEWER"]),
});

const revokeSchema = z.object({
  locale: z.string().min(2),
  id: z.string().uuid(),
});

export const createInvite = async (_prev: ActionResult, formData: FormData): Promise<ActionResult> => {
  const parsed = createSchema.safeParse({
    locale: formData.get("locale"),
    email: formData.get("email"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: "Invalid data" };
  }

  const supabase = createSupabaseServerClient();
  const service = createSupabaseServiceClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    redirect(`/${parsed.data.locale}/login`);
  }

  const role = (userData.user.user_metadata as { role?: string } | null)?.role;
  if (!canInviteUsers(role as any)) {
    return { error: "Permission denied" };
  }

  const organizationId = await ensureUserOrganization({ supabase });

  const planId = await getOrganizationPlanId(organizationId);
  const limits = getPlanLimits(planId);
  const targetLimit = parsed.data.role === "CONTRIBUTOR" ? limits.maxContributors : limits.maxViewers;

  const { count: membersCount } = await service
    .from("organization_members")
    .select("user_id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("role", parsed.data.role);

  const { count: pendingInvitesCount } = await service
    .from("organization_invites")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("role", parsed.data.role)
    .eq("status", "pending");

  const current = (membersCount ?? 0) + (pendingInvitesCount ?? 0);
  if (current >= targetLimit) {
    return { error: "Limit reached for this role on current plan." };
  }

  const { data: orgRow } = await service.from("organizations").select("name").eq("id", organizationId).single();
  const orgName = (orgRow as { name?: string } | null)?.name ?? "Your organization";

  const { data: invite, error: inviteErr } = await service
    .from("organization_invites")
    .insert({
      organization_id: organizationId,
      email: parsed.data.email,
      role: parsed.data.role,
    })
    .select("token")
    .single();

  if (inviteErr || !invite?.token) {
    return { error: inviteErr?.message ?? "Unable to create invite" };
  }

  await sendInviteEmail({
    to: parsed.data.email,
    token: invite.token as string,
    orgName,
    role: parsed.data.role,
    locale: parsed.data.locale,
  }).catch(() => {});

  return { success: "invite_created" };
};

export const revokeInvite = async (_prev: ActionResult, formData: FormData): Promise<ActionResult> => {
  const parsed = revokeSchema.safeParse({
    locale: formData.get("locale"),
    id: formData.get("id"),
  });
  if (!parsed.success) return { error: "Invalid data" };

  const supabase = createSupabaseServerClient();
  const service = createSupabaseServiceClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    redirect(`/${parsed.data.locale}/login`);
  }

  const role = (userData.user.user_metadata as { role?: string } | null)?.role;
  if (!canInviteUsers(role as any)) {
    return { error: "Permission denied" };
  }

  const organizationId = await ensureUserOrganization({ supabase });

  const { error: updError } = await service
    .from("organization_invites")
    .update({ status: "revoked" })
    .eq("id", parsed.data.id)
    .eq("organization_id", organizationId)
    .eq("status", "pending");

  if (updError) {
    return { error: updError.message };
  }

  return { success: "revoked" };
};


