"use client";

import type { JSX } from "react";
import { Card } from "@/components/ui/card";
import type { CompanyGroup, SuperAdminLabels } from "./types";
import { CompanyHeader } from "./CompanyGroupView/CompanyHeader";
import { UsersTable } from "./CompanyGroupView/UsersTable";

type CompanyGroupViewProps = {
  group: CompanyGroup;
  labels: SuperAdminLabels;
  onEnableOrg: (orgId: string) => void;
  onDisableOrg: (orgId: string) => void;
  onDeleteOrg: (orgId: string) => void;
  onEnableUser: (userId: string) => void;
  onDisableUser: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
};

export function CompanyGroupView({
  group,
  labels,
  onEnableOrg,
  onDisableOrg,
  onDeleteOrg,
  onEnableUser,
  onDisableUser,
  onDeleteUser,
}: CompanyGroupViewProps): JSX.Element {
  const { org, members } = group;

  return (
    <Card className="overflow-hidden">
      <CompanyHeader
        org={org}
        labels={labels}
        onEnableOrg={onEnableOrg}
        onDisableOrg={onDisableOrg}
        onDeleteOrg={onDeleteOrg}
      />
      <UsersTable
        members={members}
        labels={labels}
        onEnableUser={onEnableUser}
        onDisableUser={onDisableUser}
        onDeleteUser={onDeleteUser}
      />
    </Card>
  );
}

