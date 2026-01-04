import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Building2, Users } from "lucide-react";
import type { OrgRow, SuperAdminLabels } from "../types";
import { getPlanBadgeVariant, formatDeleteOrgWarning } from "./helpers";

type CompanyHeaderProps = {
  org: OrgRow;
  labels: SuperAdminLabels;
  onEnableOrg: (orgId: string) => void;
  onDisableOrg: (orgId: string) => void;
  onDeleteOrg: (orgId: string) => void;
};

export function CompanyHeader({
  org,
  labels,
  onEnableOrg,
  onDisableOrg,
  onDeleteOrg,
}: CompanyHeaderProps): JSX.Element {
  return (
    <div className="border-b bg-muted/30 px-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Building2 className="size-5 text-primary" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-foreground">{org.name}</h3>
              <Badge variant={org.disabled ? "destructive" : "default"}>
                {org.disabled ? labels.status.disabled : labels.status.active}
              </Badge>
              <Badge variant={getPlanBadgeVariant(org.plan_id)}>
                {labels.plans[org.plan_id as keyof typeof labels.plans] ?? org.plan_id}
              </Badge>
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="size-4" />
              <span>
                {org.member_count} {labels.users.count}
              </span>
            </div>
          </div>
        </div>

        {/* Company Actions */}
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
            description={`${labels.actions.deleteOrgDesc}\n\n${formatDeleteOrgWarning(
              labels.actions.deleteOrgWarning,
              org.member_count
            )}`}
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
    </div>
  );
}

