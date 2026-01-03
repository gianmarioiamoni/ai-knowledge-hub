import { getTranslations } from "next-intl/server";
import type { JSX } from "react";
import { redirect } from "@/i18n/navigation";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import { requireActiveOrganization } from "@/lib/server/organizations";
import { canManageOrg } from "@/lib/server/roles";
import { AdminPage } from "@/components/admin/AdminPage";
import { listCompanyUsers } from "@/app/[locale]/admin/actions";
import { listInvites } from "@/app/[locale]/invites/actions";

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
  const users = await listCompanyUsers({ 
    organizationId, 
    excludeUserId: data.user.id // Exclude current user from the list
  });

  // Translations for the admin page - using static labels to avoid next-intl nested key issues
  const isItalian = locale === "it";

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
        usersTitle: isItalian ? "Utenti" : "Users",
        usersSubtitle: isItalian ? "Gestisci i membri della tua organizzazione." : "Manage members of your organization.",
        filterAll: tInvites("filter.all"),
        filterPending: tInvites("filter.pending"),
        filterAccepted: tInvites("filter.accepted"),
        filterExpired: tInvites("filter.expired"),
        filterRevoked: tInvites("filter.revoked"),
        revoke: tInvites("list.revoke"),
        deleteInvite: tAdmin("deleteInvite"),
        deleteAllInvites: tAdmin("deleteAllInvites"),
        roles: {
          company: "Company Admin",
          contributor: "Contributor",
          viewer: "Viewer",
          COMPANY_ADMIN: "Company Admin",
          CONTRIBUTOR: "Contributor",
          VIEWER: "Viewer",
        },
        headers: {
          email: "Email",
          role: isItalian ? "Ruolo" : "Role",
          status: isItalian ? "Stato" : "Status",
          expires: isItalian ? "Scadenza" : "Expires",
          created: isItalian ? "Creato" : "Created",
          actions: isItalian ? "Azioni" : "Actions",
        },
        statusActive: isItalian ? "Attivo" : "Active",
        statusSuspended: isItalian ? "Sospeso" : "Suspended",
        suspend: isItalian ? "Sospendi" : "Suspend",
        enable: isItalian ? "Riattiva" : "Enable",
        deleteUser: isItalian ? "Elimina utente" : "Delete user",
        changeRole: isItalian ? "Cambia ruolo" : "Change role",
        usersEmpty: isItalian ? "Nessun utente." : "No users.",
      }}
    />
  );
}


