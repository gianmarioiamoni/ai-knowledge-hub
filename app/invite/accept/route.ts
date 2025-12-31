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
    console.error("[invite/accept] missing token");
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
    console.error("[invite/accept] invalid invite", { token, inviteErr });
    return NextResponse.redirect(new URL(`/${locale}/login?error=invalid_invite`, request.url));
  }

  const isExpired = invite.expires_at && new Date(invite.expires_at).getTime() < Date.now();
  if (invite.status !== "pending" || isExpired) {
    console.error("[invite/accept] invite expired or not pending", {
      token,
      status: invite.status,
      isExpired,
      expiresAt: invite.expires_at,
    });
    return NextResponse.redirect(new URL(`/${locale}/login?error=invite_expired`, request.url));
  }

  const targetEmail = invite.email?.toLowerCase() ?? null;

let existingUser:
  | {
      id: string;
      email?: string | null;
      user_metadata?: Record<string, unknown> | null;
      email_confirmed_at?: string | null;
    }
  | null = null;
if (targetEmail) {
  const { data: usersPage, error: listErr } = await service.auth.admin.listUsers({
    page: 1,
    perPage: 1,
    email: targetEmail,
  });
  if (listErr) {
      console.error("[invite/accept] listUsers failed", { targetEmail, listErr });
    return NextResponse.redirect(new URL(`/${locale}/login?error=invite_lookup_failed`, request.url));
  }
  const found = usersPage?.users?.[0];
  if (found) {
    existingUser = {
      id: found.id,
      email: found.email,
      user_metadata: found.user_metadata,
      email_confirmed_at: (found as { email_confirmed_at?: string | null }).email_confirmed_at ?? null,
    };
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

  const existingMembershipRow =
    existingUser?.id
      ? await service
          .from("organization_members")
          .select("user_id, role")
          .eq("organization_id", invite.organization_id)
          .eq("user_id", existingUser.id)
          .maybeSingle()
      : { data: null };

  const isAlreadyMember = Boolean(existingMembershipRow?.data);

console.info("[invite/accept] state", {
  token,
  locale,
  targetEmail,
  inviteOrg: invite.organization_id,
  inviteRole: invite.role,
  existingUser: existingUser
    ? {
        id: existingUser.id,
        email: existingUser.email,
        confirmed: existingUser.email_confirmed_at,
      }
    : null,
  isAlreadyMember,
  membersCount,
  planId,
  limits,
});

  // enforce limit only if new membership
  if (!isAlreadyMember && (membersCount ?? 0) >= targetLimit) {
    const errorMsg =
      invite.role === "CONTRIBUTOR"
        ? t("errors.limitContributor", { count: targetLimit })
        : t("errors.limitViewer", { count: targetLimit });
    return NextResponse.redirect(new URL(`/${locale}/login?error=${encodeURIComponent(errorMsg)}`, request.url));
  }

// Treat users without confirmed email as "new" to auto-provision and login
const isExistingUser = Boolean(existingUser?.id);
const shouldAutoLogin = !isExistingUser || !isAlreadyMember;

// Create or reuse user; temp password only for newly created or users without membership
let userId = existingUser?.id ?? null;
const tempPassword: string = crypto.randomUUID();
  const orgName =
    (
      await service.from("organizations").select("name").eq("id", invite.organization_id).single()
    )?.data?.name ?? undefined;

// Existing verified user: do not alter account; just ensure membership exists
if (shouldAutoLogin) {
  console.info("[invite/accept] auto-login candidate", {
    existingUser: existingUser ? existingUser.id : null,
    signInEmail: existingUser?.email ?? targetEmail,
    reason: !isExistingUser ? "new_user" : "missing_membership",
  });
  if (existingUser?.id) {
    const currentMeta = (existingUser.user_metadata as Record<string, unknown> | null) ?? {};
    const { data: updatedUser, error: updErr } = await service.auth.admin.updateUserById(existingUser.id, {
      email: existingUser.email ?? targetEmail ?? undefined,
      email_confirm: true,
      password: tempPassword,
      user_metadata: {
        ...currentMeta,
        organization_name: orgName ?? currentMeta.organization_name,
        role: invite.role,
        plan: currentMeta.plan ?? {
          id: "trial",
          billingCycle: "monthly",
          trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          renewalAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          reminder3DaysSent: false,
          reminder1DaySent: false,
        },
      },
    });
    if (updErr || !updatedUser?.user?.id) {
      return NextResponse.redirect(new URL(`/${locale}/login?error=invite_user_update_failed`, request.url));
    }
    userId = updatedUser.user.id;
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
} else {
  userId = existingUser?.id ?? userId;
}

  if (!isAlreadyMember) {
    console.info("[invite/accept] upsert membership", { userId, org: invite.organization_id, role: invite.role });
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
  }

  await service.from("organization_invites").update({ status: "accepted" }).eq("id", invite.id);

  const signInEmail = targetEmail ?? existingUser?.email ?? null;
  if (!signInEmail) {
    return NextResponse.redirect(new URL(`/${locale}/login?error=invite_email_missing`, request.url));
  }

  if (!shouldAutoLogin) {
    // Existing, already member: do nothing else
    console.info("[invite/accept] skip auto-login (already member)", { userId, email: signInEmail });
    return NextResponse.redirect(new URL(`/${locale}/login?message=invite_accepted`, request.url));
  }

  // New user: sign in with temp password to set session and force password change
  console.info("[invite/accept] signing in with temp password", { userId, email: signInEmail });
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

  const { error: signInError } = await cookieClient.auth.signInWithPassword({
    email: signInEmail,
    password: tempPassword,
  });
  if (signInError) {
    console.error("[invite/accept] signInWithPassword failed", { email: signInEmail, message: signInError.message });
    const errMsg = signInError.message ?? "invite_signin_failed";
    return NextResponse.redirect(new URL(`/${locale}/login?error=${encodeURIComponent(errMsg)}`, request.url));
  }

  console.info("[invite/accept] success redirect to dashboard", { userId, email: signInEmail });
  return response;
}


