"use client";

import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ban, Check, UserMinus } from "lucide-react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import type { UserRow, AdminLabels } from "./types";

type UsersTableProps = {
  users: UserRow[];
  labels: AdminLabels;
  roleOptions: JSX.Element;
  onRoleChange: (userId: string, newRole: string) => void;
  onToggleDisabled: (userId: string, currentDisabled: boolean) => void;
  onDeleteUser: (userId: string) => void;
};

export function UsersTable({
  users,
  labels,
  roleOptions,
  onRoleChange,
  onToggleDisabled,
  onDeleteUser,
}: UsersTableProps): JSX.Element {
  return (
    <>
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold text-foreground">{labels.usersTitle}</h3>
          <p className="text-[10px] text-muted-foreground">{labels.usersSubtitle}</p>
        </div>
        <span className="text-[10px] text-muted-foreground">{users.length}</span>
      </div>

      {/* Table */}
      {users.length === 0 ? (
        <p className="py-3 text-center text-[10px] text-muted-foreground">{labels.usersEmpty}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border/60">
          <table className="min-w-full text-[10px]">
            <thead className="bg-muted/50">
              <tr>
                <th className="min-w-[100px] px-1.5 py-1 text-left font-semibold sm:min-w-[130px] sm:px-2">
                  {labels.headers.email}
                </th>
                <th className="min-w-[85px] px-1.5 py-1 text-left font-semibold sm:min-w-[100px] sm:px-2">
                  {labels.headers.role}
                </th>
                <th className="min-w-[55px] px-1.5 py-1 text-left font-semibold sm:min-w-[70px] sm:px-2">
                  {labels.headers.status}
                </th>
                <th className="min-w-[55px] px-1.5 py-1 text-right font-semibold sm:min-w-[65px] sm:px-2">
                  {labels.headers.actions}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 bg-background">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30">
                  <td className="min-w-[100px] px-1.5 py-1 text-foreground sm:min-w-[130px] sm:px-2">
                    <div className="max-w-[100px] truncate sm:max-w-[130px]" title={u.email ?? "—"}>
                      {u.email ?? "—"}
                    </div>
                  </td>
                  <td className="min-w-[85px] px-1.5 py-1 sm:min-w-[100px] sm:px-2">
                    <select
                      value={u.role ?? "CONTRIBUTOR"}
                      onChange={(e) => onRoleChange(u.id, e.target.value)}
                      className="h-6 w-full rounded border border-border bg-background px-1 text-[9px]"
                    >
                      {roleOptions}
                    </select>
                  </td>
                  <td className="min-w-[55px] px-1.5 py-1 sm:min-w-[70px] sm:px-2">
                    <Badge variant={u.disabled ? "destructive" : "default"} className="text-[9px]">
                      {u.disabled ? labels.statusSuspended : labels.statusActive}
                    </Badge>
                  </td>
                  <td className="min-w-[55px] px-1.5 py-1 sm:min-w-[65px] sm:px-2">
                    <div className="flex justify-end gap-0.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        title={u.disabled ? labels.enable : labels.suspend}
                        onClick={() => onToggleDisabled(u.id, u.disabled)}
                        className="size-5 sm:size-6"
                      >
                        {u.disabled ? <Check className="size-2.5" /> : <Ban className="size-2.5" />}
                      </Button>
                      <ConfirmDialog
                        title={labels.deleteUserConfirmTitle}
                        description={labels.deleteUserConfirmDescription}
                        confirmLabel={labels.deleteUserConfirmButton}
                        cancelLabel={labels.cancel}
                        onConfirm={() => onDeleteUser(u.id)}
                        trigger={
                          <Button size="icon" variant="ghost" title={labels.deleteUser} className="size-5 sm:size-6">
                            <UserMinus className="size-2.5" />
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
    </>
  );
}

