"use client";

import type { JSX } from "react";
import { useRouter } from "next/navigation";
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
    <div className={`mx-auto min-h-screen max-w-6xl px-6 py-4 sm:px-6 sm:py-6 lg:px-6 xl:px-0`}>
      {/* Header */}
      <div className="mb-6 space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          {labels.title}
        </p>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">{labels.subtitle}</h1>
        <p className="text-sm text-muted-foreground">{labels.description}</p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
        {/* LEFT COLUMN: Invites */}
        <div className="space-y-3">
          <InviteForm
            locale={locale}
            labels={labels}
            inviteAction={inviteAction}
            invitePending={invitePending}
          />
          <InvitesTable
            locale={locale}
            invites={filteredInvites}
            currentStatus={currentStatus}
            labels={labels}
            onStatusChange={handleStatusChange}
            bindAction={bindAction}
          />
        </div>

        {/* RIGHT COLUMN: Users */}
        <div className="space-y-3">
          <UsersTable
            users={users}
            labels={labels}
            roleOptions={roleOptions}
            onRoleChange={handleRoleChange}
            onToggleDisabled={handleToggleDisabled}
            onDeleteUser={handleDeleteUser}
          />
        </div>
      </div>
    </div>
  );
}

