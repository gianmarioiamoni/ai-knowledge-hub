"use client";

import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import type { AdminUserRow, SuperAdminLabels } from "./types";

type UsersTableProps = {
  rows: AdminUserRow[];
  labels: SuperAdminLabels;
  isPending: boolean;
  onAction: (action: string, userId?: string) => void;
};

function UsersTable({ rows, labels, isPending, onAction }: UsersTableProps): JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border/80 text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-3 py-2 text-left font-semibold text-foreground">{labels.email}</th>
            <th className="px-3 py-2 text-left font-semibold text-foreground">{labels.role}</th>
            <th className="px-3 py-2 text-left font-semibold text-foreground">Plan</th>
            <th className="px-3 py-2 text-left font-semibold text-foreground">{labels.status}</th>
            <th className="px-3 py-2 text-left font-semibold text-foreground">{labels.created}</th>
            <th className="px-3 py-2 text-left font-semibold text-foreground">{labels.actions}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/80">
          {rows.map((user) => (
            <tr key={user.id}>
              <td className="px-3 py-2 text-foreground">{user.email ?? "—"}</td>
              <td className="px-3 py-2 text-muted-foreground">{user.role ?? "—"}</td>
              <td className="px-3 py-2 text-muted-foreground">{user.plan ?? "—"}</td>
              <td className="px-3 py-2">
                <span
                  className={
                    user.banned
                      ? "rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700"
                      : "rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700"
                  }
                >
                  {user.statusLabel}
                </span>
              </td>
              <td className="px-3 py-2 text-muted-foreground">
                {user.createdAt ? new Date(user.createdAt).toLocaleString() : "—"}
              </td>
              <td className="px-3 py-2">
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onAction("promote", user.id)}
                    disabled={isPending || (user.role ?? "").toUpperCase() === "ORG_ADMIN"}
                  >
                    {labels.promote}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAction("demote", user.id)}
                    disabled={isPending || (user.role ?? "").toUpperCase() !== "ORG_ADMIN"}
                  >
                    {labels.demote}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-500 text-amber-700 hover:bg-amber-50"
                    onClick={() => onAction(user.banned ? "enable" : "disable", user.id)}
                    disabled={isPending}
                  >
                    {user.banned ? labels.enable : labels.disable}
                  </Button>
                  <ConfirmDialog
                    title={labels.deleteUserTitle}
                    description={`${labels.deleteUserDesc}\n\n${user.email ?? user.id}`}
                    confirmLabel={labels.delete}
                    cancelLabel={labels.cancel}
                    onConfirm={() => onAction("delete", user.id)}
                    trigger={
                      <Button size="sm" variant="destructive" disabled={isPending}>
                        {labels.delete}
                      </Button>
                    }
                  />
                </div>
              </td>
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td className="px-3 py-4 text-sm text-muted-foreground" colSpan={5}>
                {labels.loading}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

export { UsersTable };

