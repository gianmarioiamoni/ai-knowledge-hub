// lib/server/organizations.ts
import type { SupabaseClient } from "@supabase/supabase-js";

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

  const { data: memberships, error: membershipError } = await supabase
    .from("organization_members")
    .select("organization_id")
    .limit(1);

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  const existing = memberships?.[0]?.organization_id;
  if (existing) {
    return existing;
  }

  const orgName = userData.user.email ? `Org - ${userData.user.email}` : fallbackName;

  const { data: orgInsert, error: orgError } = await supabase
    .from("organizations")
    .insert({ name: orgName })
    .select("id")
    .single();

  if (orgError || !orgInsert?.id) {
    throw new Error(orgError?.message ?? "Unable to create organization");
  }

  return orgInsert.id as string;
};

