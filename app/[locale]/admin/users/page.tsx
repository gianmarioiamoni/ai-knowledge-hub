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
  const orgs: OrgRow[] = (orgRows ?? []) as OrgRow[];

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
    usersData?.users?.reduce<Record<string, { email: string | null; created_at: string | null; is_demo_user: boolean }>>((acc, u) => {
      const isDemoUser = (u.user_metadata as { is_demo_user?: boolean } | null)?.is_demo_user ?? false;
      acc[u.id] = { 
        email: u.email ?? null, 
        created_at: u.created_at ?? null,
        is_demo_user: isDemoUser,
      };
      return acc;
    }, {}) ?? {};

  const membersWithUser: MemberRow[] = members.map((m) => ({
    ...m,
    email: usersById[m.user_id]?.email ?? null,
    created_at: usersById[m.user_id]?.created_at ?? null,
    is_demo_user: usersById[m.user_id]?.is_demo_user ?? false,
  }));

  // Build labels object
  const labels = {
    title: t("title"),
    subtitle: t("subtitle"),
    description: t("description"),
    orgsTitle: t("orgsTitle"),
    usersTitle: t("usersTitle"),
    empty: t("empty"),
    status: {
      active: t("status.active"),
      disabled: t("status.disabled"),
    },
    users: {
      email: t("users.email"),
      org: t("users.org"),
      role: t("users.role"),
      status: t("users.status"),
      actions: t("users.actions"),
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

