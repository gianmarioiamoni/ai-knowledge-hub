"use client";

import type { JSX } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import type { CompanyGroup, SuperAdminLabels } from "./types";
import { Building2, Users } from "lucide-react";

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
  
  const getPlanBadgeVariant = (planId: string) => {
    if (planId === "demo") return "secondary";
    if (planId === "trial") return "outline";
    if (planId === "smb") return "default";
    if (planId === "enterprise") return "default";
    return "outline";
  };

  return (
    <Card className="overflow-hidden">
      {/* Company Header */}
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
              description={`${labels.actions.deleteOrgDesc}\n\n${labels.actions.deleteOrgWarning.replace("{count}", String(org.member_count))}`}
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

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border/80 text-sm">
          <thead className="bg-muted/20">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-foreground">
                {labels.users.email}
              </th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">
                {labels.users.role}
              </th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">
                {labels.users.status}
              </th>
              <th className="px-4 py-3 text-right font-semibold text-foreground">
                {labels.users.actions}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/80 bg-background/40">
            {members.map((m) => (
              <tr key={m.user_id} className={m.is_demo_user ? "bg-blue-50/30" : ""}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground">{m.email ?? m.user_id}</span>
                    {m.is_demo_user && (
                      <Badge variant="secondary" className="text-xs">
                        DEMO
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{m.role}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {m.disabled ? labels.status.disabled : labels.status.active}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    {m.disabled ? (
                      <Button size="sm" variant="secondary" onClick={() => onEnableUser(m.user_id)}>
                        {labels.actions.enable}
                      </Button>
                    ) : (
                      <ConfirmDialog
                        title={labels.actions.disableUserTitle}
                        description={labels.actions.disableUserDesc}
                        confirmLabel={labels.actions.disable}
                        cancelLabel={labels.actions.cancel}
                        onConfirm={() => onDisableUser(m.user_id)}
                        trigger={
                          <Button size="sm" variant="ghost" className="text-amber-700 hover:text-amber-800">
                            {labels.actions.disable}
                          </Button>
                        }
                      />
                    )}
                    <ConfirmDialog
                      title={labels.actions.deleteUserTitle}
                      description={labels.actions.deleteUserDesc}
                      confirmLabel={labels.actions.delete}
                      cancelLabel={labels.actions.cancel}
                      onConfirm={() => onDeleteUser(m.user_id)}
                      trigger={
                        <Button size="sm" variant="destructive">
                          {labels.actions.delete}
                        </Button>
                      }
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

