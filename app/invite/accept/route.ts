import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createSupabaseServiceClient } from "@/lib/server/supabaseService";
import { getOrganizationPlanId, getPlanLimits } from "@/lib/server/subscriptions";
import { getTranslations } from "next-intl/server";
import { env } from "@/lib/env";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const search = request.nextUrl.searchParams;
  const token = search.get("token");
  const locale = search.get("locale") ?? "en";

  if (!token) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  const service = createSupabaseServiceClient();
  const t = await getTranslations({ locale, namespace: "invites" });

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

  const targetEmail = invite.email?.toLowerCase() ?? null;

  let existingUser: { id: string; email?: string | null } | null = null;
  if (targetEmail) {
    const { data: usersPage, error: listErr } = await service.auth.admin.listUsers({
      page: 1,
      perPage: 1,
      email: targetEmail,
    });
    if (listErr) {
      return NextResponse.redirect(new URL(`/${locale}/login?error=invite_lookup_failed`, request.url));
    }
    const found = usersPage?.users?.[0];
    if (found) {
      existingUser = { id: found.id, email: found.email };
    }
  }

  const planId = await getOrganizationPlanId(invite.organization_id);
  const limits = getPlanLimits(planId);
  const targetLimit = invite.role === "CONTRIBUTOR" ? limits.maxContributors : limits.maxViewers;

  const { count: membersCount } = await service
    .from("organization_members")
    .select("user_id", { count: "exact", head: true })
    .eq("organization_id", invite.organization_id)
    .eq("role", invite.role);

  const isAlreadyMember = existingUser?.id
    ? Boolean(
        await service
          .from("organization_members")
          .select("user_id", { head: true, count: "exact" })
          .eq("organization_id", invite.organization_id)
          .eq("user_id", existingUser.id)
      )
    : false;

  // enforce limit only if new membership
  if (!isAlreadyMember && (membersCount ?? 0) >= targetLimit) {
    const errorMsg =
      invite.role === "CONTRIBUTOR"
        ? t("errors.limitContributor", { count: targetLimit })
        : t("errors.limitViewer", { count: targetLimit });
    return NextResponse.redirect(new URL(`/${locale}/login?error=${encodeURIComponent(errorMsg)}`, request.url));
  }

  // Create or reuse user
  let userId = existingUser?.id ?? null;
  let tempPassword: string | null = crypto.randomUUID();
  const orgName =
    (
      await service.from("organizations").select("name").eq("id", invite.organization_id).single()
    )?.data?.name ?? undefined;

  if (userId) {
    const { error: updErr } = await service.auth.admin.updateUserById(userId, {
      email: existingUser.email ?? targetEmail ?? undefined,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        role: invite.role,
        organization_name: orgName,
      },
    });
    if (updErr) {
      return NextResponse.redirect(new URL(`/${locale}/login?error=invite_user_update_failed`, request.url));
    }
  } else {
    const { data: createdUser, error: createErr } = await service.auth.admin.createUser({
      email: targetEmail ?? `invite-${token}@example.com`,
      email_confirm: true,
      password: tempPassword,
      user_metadata: {
        role: invite.role,
        organization_name: orgName,
        plan: {
          id: "trial",
          billingCycle: "monthly",
          trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          renewalAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          reminder3DaysSent: false,
          reminder1DaySent: false,
        },
      },
    });
    if (createErr || !createdUser?.user?.id) {
      return NextResponse.redirect(new URL(`/${locale}/login?error=invite_user_create_failed`, request.url));
    }
    userId = createdUser.user.id;
  }

  await service
    .from("organization_members")
    .upsert({
      user_id: userId,
      organization_id: invite.organization_id,
      role: invite.role,
      disabled: false,
    })
    .eq("user_id", userId)
    .eq("organization_id", invite.organization_id);

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

  await service.from("organization_invites").update({ status: "accepted" }).eq("id", invite.id);

  // Sign in (create session) and force password change
  const response = NextResponse.redirect(new URL(`/${locale}/dashboard?forcePassword=true`, request.url));
  const cookieClient = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options) {
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options) {
        response.cookies.set({ name, value: "", ...options, maxAge: 0 });
      },
    },
  });

  const signInEmail = targetEmail ?? existingUser?.email ?? null;
  if (signInEmail && tempPassword) {
    const { error: signInError } = await cookieClient.auth.signInWithPassword({
      email: signInEmail,
      password: tempPassword,
    });
    if (signInError) {
      return NextResponse.redirect(new URL(`/${locale}/login?error=${encodeURIComponent(signInError.message)}`, request.url));
    }
  }

  return response;
}


