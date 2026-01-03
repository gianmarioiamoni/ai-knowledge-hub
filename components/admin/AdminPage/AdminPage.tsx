"use client";

import type { JSX } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import type { InviteRow, UserRow, AdminLabels } from "./types";
import { useUserManagement } from "./useUserManagement";
import { useInviteForm } from "./useInviteForm";
import { useInviteFilters } from "./useInviteFilters";
import { InviteForm } from "./InviteForm";
import { InvitesTable } from "./InvitesTable";
import { UsersTable } from "./UsersTable";
import { LAYOUT_CLASSES } from "@/lib/styles/layout";

type AdminPageProps = {
  locale: string;
  invites: InviteRow[];
  users: UserRow[];
  labels: AdminLabels;
};

export function AdminPage({ locale, invites, users: initialUsers, labels }: AdminPageProps): JSX.Element {
  const router = useRouter();

  // Custom hooks for logic
  const { users, handleRoleChange, handleToggleDisabled, handleDeleteUser } = useUserManagement({
    initialUsers,
    locale,
    labels,
  });

  const { inviteAction, invitePending } = useInviteForm({ locale, labels });

  const { currentStatus, filteredInvites, handleStatusChange } = useInviteFilters(invites);

  // Helper to bind actions
  const bindAction =
    (action: (prevState: any, formData: FormData) => Promise<any>) => async (formData: FormData) => {
      const result = await action({}, formData);
      if (result?.success) {
        router.refresh();
      }
      return result;
    };

  // Role options for select
  const roleOptions = (
    <>
      <option value="COMPANY_ADMIN">{labels.roles.COMPANY_ADMIN}</option>
      <option value="CONTRIBUTOR">{labels.roles.CONTRIBUTOR}</option>
      <option value="VIEWER">{labels.roles.VIEWER}</option>
    </>
  );

  return (
    <div className={`mx-auto min-h-screen max-w-6xl ${LAYOUT_CLASSES.horizontalPadding} py-4 sm:py-6`}>
      {/* Header with logout */}
      <PageHeader
        title={labels.title}
        subtitle={labels.subtitle}
        description={labels.description}
        showLogout
        logoutLabel={labels.logout}
      />

      {/* Two Column Layout */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
        {/* LEFT COLUMN: Invites */}
        <div className="space-y-3">
          <Card className="p-2">
            <h2 className="mb-2 text-sm font-semibold text-foreground">{labels.inviteFormTitle}</h2>
            <InviteForm
              locale={locale}
              labels={labels}
              inviteAction={inviteAction}
              invitePending={invitePending}
            />
          </Card>
          <Card className="p-2 flex-grow">
            <InvitesTable
              locale={locale}
              invites={filteredInvites}
              currentStatus={currentStatus}
              labels={labels}
              onStatusChange={handleStatusChange}
              bindAction={bindAction}
            />
          </Card>
        </div>

        {/* RIGHT COLUMN: Users */}
        <div className="space-y-3">
          <Card className="p-2 flex-grow">
            <UsersTable
              users={users}
              labels={labels}
              roleOptions={roleOptions}
              onRoleChange={handleRoleChange}
              onToggleDisabled={handleToggleDisabled}
              onDeleteUser={handleDeleteUser}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}

