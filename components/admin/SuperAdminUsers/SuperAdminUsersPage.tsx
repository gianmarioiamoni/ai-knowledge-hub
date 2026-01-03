"use client";

import type { JSX } from "react";
import type { OrgRow, MemberRow, SuperAdminLabels } from "./types";
import { useOrgActions } from "./useOrgActions";
import { useUserActions } from "./useUserActions";
import { OrganizationsList } from "./OrganizationsList";
import { UsersList } from "./UsersList";
import { LAYOUT_CLASSES } from "@/lib/styles/layout";

type SuperAdminUsersPageProps = {
  locale: string;
  orgs: OrgRow[];
  members: MemberRow[];
  labels: SuperAdminLabels;
};

export function SuperAdminUsersPage({
  locale,
  orgs,
  members,
  labels,
}: SuperAdminUsersPageProps): JSX.Element {
  const { handleEnableOrg, handleDisableOrg, handleDeleteOrg } = useOrgActions(locale);
  const { handleEnableUser, handleDisableUser, handleDeleteUser } = useUserActions(locale);

  return (
    <div className={LAYOUT_CLASSES.pageContainerWide}>
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{labels.title}</p>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">{labels.subtitle}</h1>
        <p className="text-sm text-muted-foreground">{labels.description}</p>
      </div>

      <OrganizationsList
        orgs={orgs}
        labels={labels}
        onEnableOrg={handleEnableOrg}
        onDisableOrg={handleDisableOrg}
        onDeleteOrg={handleDeleteOrg}
      />

      <UsersList
        members={members}
        orgs={orgs}
        labels={labels}
        onEnableUser={handleEnableUser}
        onDisableUser={handleDisableUser}
        onDeleteUser={handleDeleteUser}
      />
    </div>
  );
}

