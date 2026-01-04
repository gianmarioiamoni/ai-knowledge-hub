import { getTranslations } from "next-intl/server";
import type { JSX } from "react";
import { redirect } from "@/i18n/navigation";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import { createSupabaseServiceClient } from "@/lib/server/supabaseService";
import { SuperAdminUsersPage } from "@/components/admin/SuperAdminUsers";
import type { OrgRow, MemberRow } from "@/components/admin/SuperAdminUsers";

export const dynamic = "force-dynamic";

export default async function AdminUsersRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<JSX.Element> {
  const { locale } = await params;
  
  // Auth check
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect({ href: "/login", locale });
  }
  
  // Non-null assertion safe here because redirect throws
  const role = (data.user!.user_metadata as { role?: string } | null)?.role ?? null;
  if (role !== "SUPER_ADMIN") {
    redirect({ href: "/dashboard", locale });
  }

  // Translations
  const t = await getTranslations({ locale, namespace: "adminUsers" });
  
  // Data fetching
  const service = createSupabaseServiceClient();

  const { data: orgRows } = await service.from("organizations").select("id,name,disabled");
  const rawOrgs = (orgRows ?? []) as Array<{ id: string; name: string; disabled: boolean }>;

  const { data: memberRows } = await service
    .from("organization_members")
    .select("user_id,organization_id,role,disabled");
  const members = (memberRows ?? []) as Array<{
    user_id: string;
    organization_id: string;
    role: string;
    disabled: boolean;
  }>;

  const { data: usersData } = await service.auth.admin.listUsers();
  const usersById =
    usersData?.users?.reduce<Record<string, { email: string | null; created_at: string | null; is_demo_user: boolean; plan_id: string }>>((acc, u) => {
      const isDemoUser = (u.user_metadata as { is_demo_user?: boolean } | null)?.is_demo_user ?? false;
      const planId = ((u.user_metadata as { plan?: { id?: string } } | null)?.plan?.id) ?? "trial";
      acc[u.id] = { 
        email: u.email ?? null, 
        created_at: u.created_at ?? null,
        is_demo_user: isDemoUser,
        plan_id: planId,
      };
      return acc;
    }, {}) ?? {};

  const membersWithUser: MemberRow[] = members.map((m) => ({
    ...m,
    email: usersById[m.user_id]?.email ?? null,
    created_at: usersById[m.user_id]?.created_at ?? null,
    is_demo_user: usersById[m.user_id]?.is_demo_user ?? false,
  }));

  // Count members per org and get plan_id from first COMPANY_ADMIN
  const orgs: OrgRow[] = rawOrgs.map((org) => {
    const orgMembers = members.filter((m) => m.organization_id === org.id);
    const adminMember = orgMembers.find((m) => m.role === "COMPANY_ADMIN");
    const planId = adminMember ? (usersById[adminMember.user_id]?.plan_id ?? "trial") : "trial";
    
    return {
      ...org,
      plan_id: planId,
      member_count: orgMembers.length,
    };
  });

  // Build labels object
  const labels = {
    title: t("title"),
    subtitle: t("subtitle"),
    description: t("description"),
    orgsTitle: t("orgsTitle"),
    usersTitle: t("usersTitle"),
    empty: t("empty"),
    filters: {
      all: t("filters.all"),
      company: t("filters.company"),
      status: t("filters.status"),
      plan: t("filters.plan"),
      role: t("filters.role"),
      showDemo: t("filters.showDemo"),
      search: t("filters.search"),
    },
    status: {
      active: t("status.active"),
      disabled: t("status.disabled"),
    },
    plans: {
      trial: t("plans.trial"),
      demo: t("plans.demo"),
      smb: t("plans.smb"),
      enterprise: t("plans.enterprise"),
      expired: t("plans.expired"),
    },
    users: {
      email: t("users.email"),
      org: t("users.org"),
      role: t("users.role"),
      status: t("users.status"),
      actions: t("users.actions"),
      count: t("users.count"),
    },
    actions: {
      enable: t("actions.enable"),
      disable: t("actions.disable"),
      delete: t("actions.delete"),
      cancel: t("actions.cancel"),
      disableOrgTitle: t("actions.disableOrgTitle"),
      disableOrgDesc: t("actions.disableOrgDesc"),
      deleteOrgTitle: t("actions.deleteOrgTitle"),
      deleteOrgDesc: t("actions.deleteOrgDesc"),
      deleteOrgWarning: t.raw("actions.deleteOrgWarning") as string,
      disableUserTitle: t("actions.disableUserTitle"),
      disableUserDesc: t("actions.disableUserDesc"),
      deleteUserTitle: t("actions.deleteUserTitle"),
      deleteUserDesc: t("actions.deleteUserDesc"),
    },
  };

  return (
    <SuperAdminUsersPage
      locale={locale}
      orgs={orgs}
      members={membersWithUser}
      labels={labels}
    />
  );
}

