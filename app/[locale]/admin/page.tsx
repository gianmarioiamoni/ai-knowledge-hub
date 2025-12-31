import { getTranslations } from "next-intl/server";
import type { JSX } from "react";
import { redirect } from "@/i18n/navigation";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import { requireActiveOrganization } from "@/lib/server/organizations";
import { canManageOrg } from "@/lib/server/roles";
import { AdminPage } from "@/components/admin/AdminPage";
import { listCompanyUsers } from "@/app/[locale]/admin/actions";
import { listInvites, revokeInvite, deleteInvite, deleteAllInvites } from "@/app/[locale]/invites/actions";

export const dynamic = "force-dynamic";

export default async function AdminPageRoute({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ status?: string }> | { status?: string };
}): Promise<JSX.Element> {
  const { locale } = await params;
  const filters = searchParams ? await searchParams : {};

  const tAdmin = await getTranslations({ locale, namespace: "admin" });
  const tInvites = await getTranslations({ locale, namespace: "invites" });
  const tUsers = await getTranslations({ locale, namespace: "adminUsers" });

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    redirect({ href: "/login", locale });
  }

  const { role, organizationId } = await requireActiveOrganization({ supabase, locale });
  if (!canManageOrg(role as any)) {
    redirect({ href: "/dashboard", locale });
  }

  const invites = await listInvites({ organizationId, status: filters.status });
  const users = await listCompanyUsers({ organizationId });

  return (
    <AdminPage
      locale={locale}
      invites={invites}
      users={users}
      labels={{
        title: tAdmin("title"),
        invitesTitle: tInvites("title"),
        invitesSubtitle: tInvites("subtitle"),
      invitesEmpty: tInvites("list.empty"),
        usersTitle: tUsers("title"),
        usersSubtitle: tUsers("subtitle"),
        filterAll: tInvites("filter.all"),
        filterPending: tInvites("filter.pending"),
        filterAccepted: tInvites("filter.accepted"),
        filterExpired: tInvites("filter.expired"),
        filterRevoked: tInvites("filter.revoked"),
        revoke: tInvites("list.revoke"),
        deleteInvite: tAdmin("deleteInvite"),
        deleteAllInvites: tAdmin("deleteAllInvites"),
        roles: tUsers.raw("roles") as {
          company: string;
          contributor: string;
          viewer: string;
        },
        suspend: tUsers("suspend"),
        enable: tUsers("enable"),
        deleteUser: tUsers("deleteUser"),
        changeRole: tUsers("changeRole"),
      usersEmpty: tUsers("empty"),
      }}
      actions={{
        revokeInvite,
        deleteInvite,
        deleteAllInvites,
      }}
    />
  );
}


