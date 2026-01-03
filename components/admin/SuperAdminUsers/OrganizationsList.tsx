"use client";

import type { JSX } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import type { OrgRow, SuperAdminLabels } from "./types";

type OrganizationsListProps = {
  orgs: OrgRow[];
  labels: SuperAdminLabels;
  onEnableOrg: (orgId: string) => void;
  onDisableOrg: (orgId: string) => void;
  onDeleteOrg: (orgId: string) => void;
};

export function OrganizationsList({
  orgs,
  labels,
  onEnableOrg,
  onDisableOrg,
  onDeleteOrg,
}: OrganizationsListProps): JSX.Element {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground">{labels.orgsTitle}</h2>
      <div className="mt-4 space-y-2">
        {orgs.length === 0 ? (
          <p className="text-sm text-muted-foreground">{labels.empty}</p>
        ) : (
          orgs.map((org) => (
            <div
              key={org.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2"
            >
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">{org.name}</span>
                <span className="text-xs text-muted-foreground">
                  {org.disabled ? labels.status.disabled : labels.status.active}
                </span>
              </div>
              <div className="flex gap-2">
                {org.disabled ? (
                  <Button size="sm" variant="secondary" onClick={() => onEnableOrg(org.id)}>
                    {labels.actions.enable}
                  </Button>
                ) : (
                  <ConfirmDialog
                    title={labels.actions.disableOrgTitle}
                    description={labels.actions.disableOrgDesc}
                    confirmLabel={labels.actions.disable}
                    cancelLabel={labels.actions.cancel}
                    onConfirm={() => onDisableOrg(org.id)}
                    trigger={
                      <Button size="sm" variant="ghost" className="text-amber-700 hover:text-amber-800">
                        {labels.actions.disable}
                      </Button>
                    }
                  />
                )}
                <ConfirmDialog
                  title={labels.actions.deleteOrgTitle}
                  description={labels.actions.deleteOrgDesc}
                  confirmLabel={labels.actions.delete}
                  cancelLabel={labels.actions.cancel}
                  onConfirm={() => onDeleteOrg(org.id)}
                  trigger={
                    <Button size="sm" variant="destructive">
                      {labels.actions.delete}
                    </Button>
                  }
                />
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

