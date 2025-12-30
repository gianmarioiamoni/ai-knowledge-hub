// lib/server/organizations.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServiceClient } from "./supabaseService";
import { redirect } from "@/i18n/navigation";
import type { UserRole } from "./roles";

type EnsureOrganizationParams = {
  supabase: SupabaseClient;
  fallbackName?: string;
};

/**
 * Returns an organization_id for the authenticated user, creating a default one if none exists.
 * Relies on RLS + trigger to add the creator as ORG_ADMIN.
 */
export const ensureUserOrganization = async ({
  supabase,
  fallbackName = "Default organization",
}: EnsureOrganizationParams): Promise<string> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("User not authenticated");
  }

  const service = createSupabaseServiceClient();

  const { data: memberships, error: membershipError } = await service
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userData.user.id)
    .limit(1);

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  const existing = memberships?.[0]?.organization_id;
  if (existing) {
    return existing;
  }

  const orgName =
    userData.user.user_metadata?.organization_name ??
    (userData.user.email ? `Org - ${userData.user.email}` : fallbackName);

  const { data: orgInsert, error: orgError } = await service
    .from("organizations")
    .insert({ name: orgName })
    .select("id")
    .single();

  if (orgError || !orgInsert?.id) {
    throw new Error(orgError?.message ?? "Unable to create organization");
  }

  const orgId = orgInsert.id as string;

  // Explicitly add the user as COMPANY_ADMIN (service role bypasses the trigger auth.uid()).
  const { error: memberError } = await service.from("organization_members").insert({
    user_id: userData.user.id,
    organization_id: orgId,
    role: "COMPANY_ADMIN",
  });

  if (memberError) {
    throw new Error(memberError.message ?? "Unable to attach user to organization");
  }

  // Update user metadata with org info and role if missing
  const currentRole = (userData.user.user_metadata as { role?: UserRole } | null)?.role;
  await supabase.auth.updateUser({
    data: {
      ...((userData.user.user_metadata as Record<string, unknown> | null) ?? {}),
      organization_name: orgName,
      role: currentRole ?? "COMPANY_ADMIN",
    },
  });

  return orgId;
};

type ActiveOrg = {
  organizationId: string;
  organizationName: string | null;
  role: UserRole;
  orgDisabled: boolean;
  memberDisabled: boolean;
};

const fetchMembership = async (
  userId: string
): Promise<{ organization_id: string; role: UserRole; member_disabled: boolean; org_name: string | null; org_disabled: boolean } | null> => {
  const service = createSupabaseServiceClient();
  const { data } = await service
    .from("organization_members")
    .select("organization_id, role, disabled, organizations(name, disabled)")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  const org = (data as { organizations?: { name?: string | null; disabled?: boolean } }).organizations;
  return {
    organization_id: (data as { organization_id: string }).organization_id,
    role: ((data as { role?: string }).role as UserRole) ?? null,
    member_disabled: Boolean((data as { disabled?: boolean }).disabled),
    org_name: org?.name ?? null,
    org_disabled: Boolean(org?.disabled),
  };
};

export const requireActiveOrganization = async ({
  supabase,
  locale,
}: {
  supabase: SupabaseClient;
  locale: string;
}): Promise<ActiveOrg> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    redirect({ href: "/login", locale });
  }

  let membership = await fetchMembership(userData.user!.id);
  if (!membership) {
    const orgId = await ensureUserOrganization({ supabase });
    const service = createSupabaseServiceClient();
    const { data: orgRow } = await service.from("organizations").select("name,disabled").eq("id", orgId).single();
    membership = {
      organization_id: orgId,
      role: "COMPANY_ADMIN",
      member_disabled: false,
      org_name: (orgRow as { name?: string | null } | null)?.name ?? null,
      org_disabled: Boolean((orgRow as { disabled?: boolean } | null)?.disabled),
    };
  }

  if (membership.org_disabled || membership.member_disabled) {
    redirect({ href: "/login?error=org_disabled", locale });
  }

  return {
    organizationId: membership.organization_id,
    organizationName: membership.org_name,
    role: membership.role,
    orgDisabled: membership.org_disabled,
    memberDisabled: membership.member_disabled,
  };
};

export const requireActiveOrganizationId = async ({
  supabase,
  locale,
}: {
  supabase: SupabaseClient;
  locale: string;
}): Promise<string> => {
  const org = await requireActiveOrganization({ supabase, locale });
  return org.organizationId;
};

