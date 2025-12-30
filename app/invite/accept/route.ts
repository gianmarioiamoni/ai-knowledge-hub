import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import { createSupabaseServiceClient } from "@/lib/server/supabaseService";
import { getOrganizationPlanId, getPlanLimits } from "@/lib/server/subscriptions";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const search = request.nextUrl.searchParams;
  const token = search.get("token");
  const locale = search.get("locale") ?? "en";

  if (!token) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  const supabase = createSupabaseServerClient();
  const service = createSupabaseServiceClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return NextResponse.redirect(new URL(`/login?next=/invite/accept?token=${token}&locale=${locale}`, request.url));
  }

  const { data: invite, error: inviteErr } = await service
    .from("organization_invites")
    .select("id,organization_id,email,role,status,expires_at")
    .eq("token", token)
    .single();

  if (inviteErr || !invite) {
    return NextResponse.redirect(new URL(`/${locale}/login?error=invalid_invite`, request.url));
  }

  const isExpired = invite.expires_at && new Date(invite.expires_at).getTime() < Date.now();
  if (invite.status !== "pending" || isExpired) {
    return NextResponse.redirect(new URL(`/${locale}/login?error=invite_expired`, request.url));
  }

  if (invite.email && invite.email.toLowerCase() !== (userData.user.email ?? "").toLowerCase()) {
    return NextResponse.redirect(new URL(`/${locale}/login?error=invite_email_mismatch`, request.url));
  }

  const existingMembership = await service
    .from("organization_members")
    .select("role")
    .eq("organization_id", invite.organization_id)
    .eq("user_id", userData.user.id)
    .maybeSingle();

  const planId = await getOrganizationPlanId(invite.organization_id);
  const limits = getPlanLimits(planId);
  const targetLimit = invite.role === "CONTRIBUTOR" ? limits.maxContributors : limits.maxViewers;

  const { count: membersCount } = await service
    .from("organization_members")
    .select("user_id", { count: "exact", head: true })
    .eq("organization_id", invite.organization_id)
    .eq("role", invite.role);

  // If already member, do not block; otherwise enforce limit
  if (!existingMembership.data && (membersCount ?? 0) >= targetLimit) {
    return NextResponse.redirect(new URL(`/${locale}/login?error=role_limit_reached`, request.url));
  }

  await service
    .from("organization_members")
    .upsert({
      user_id: userData.user.id,
      organization_id: invite.organization_id,
      role: invite.role,
      disabled: false,
    })
    .eq("user_id", userData.user.id)
    .eq("organization_id", invite.organization_id);

  await service
    .from("organization_invites")
    .update({ status: "accepted" })
    .eq("id", invite.id);

  // update user metadata with org name
  const { data: orgRow } = await service.from("organizations").select("name").eq("id", invite.organization_id).single();
  const orgName = (orgRow as { name?: string } | null)?.name;

  await supabase.auth.updateUser({
    data: {
      ...((userData.user.user_metadata as Record<string, unknown> | null) ?? {}),
      role: invite.role,
      organization_name: orgName,
    },
  });

  return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
}


