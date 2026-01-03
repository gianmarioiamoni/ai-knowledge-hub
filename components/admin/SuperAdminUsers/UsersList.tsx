"use client";

import type { JSX } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import type { MemberRow, OrgRow, SuperAdminLabels } from "./types";
import { getOrgName } from "./helpers";

type UsersListProps = {
  members: MemberRow[];
  orgs: OrgRow[];
  labels: SuperAdminLabels;
  onEnableUser: (userId: string) => void;
  onDisableUser: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
};

export function UsersList({
  members,
  orgs,
  labels,
  onEnableUser,
  onDisableUser,
  onDeleteUser,
}: UsersListProps): JSX.Element {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground">{labels.usersTitle}</h2>
      {members.length === 0 ? (
        <p className="text-sm text-muted-foreground">{labels.empty}</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/60">
          <table className="min-w-full divide-y divide-border/80 text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-foreground">{labels.users.email}</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">{labels.users.org}</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">{labels.users.role}</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">{labels.users.status}</th>
                <th className="px-4 py-3 text-right font-semibold text-foreground">{labels.users.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/80 bg-background/40">
              {members.map((m) => (
                <tr key={`${m.organization_id}-${m.user_id}`}>
                  <td className="px-4 py-3 text-foreground">{m.email ?? m.user_id}</td>
                  <td className="px-4 py-3 text-muted-foreground">{getOrgName(m.organization_id, orgs)}</td>
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
      )}
    </Card>
  );
}

