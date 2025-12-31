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
        roles: {
          company: tUsers("roles.company", { fallback: "Company Admin" }),
          contributor: tUsers("roles.contributor", { fallback: "Contributor" }),
          viewer: tUsers("roles.viewer", { fallback: "Viewer" }),
        },
        headers: {
          email: tUsers("headers.email", { fallback: "Email" }),
          role: tUsers("headers.role", { fallback: "Role" }),
          status: tUsers("headers.status", { fallback: "Status" }),
          expires: tUsers("headers.expires", { fallback: "Expires" }),
          created: tUsers("headers.created", { fallback: "Created" }),
          actions: tUsers("headers.actions", { fallback: "Actions" }),
        },
        statusActive: tUsers("statusActive", { fallback: "Active" }),
        statusSuspended: tUsers("statusSuspended", { fallback: "Suspended" }),
        suspend: tUsers("suspend", { fallback: "Suspend" }),
        enable: tUsers("enable", { fallback: "Enable" }),
        deleteUser: tUsers("deleteUser", { fallback: "Delete user" }),
        changeRole: tUsers("changeRole", { fallback: "Change role" }),
      usersEmpty: tUsers("empty", { fallback: "No users." }),
      }}
    />
  );
}


