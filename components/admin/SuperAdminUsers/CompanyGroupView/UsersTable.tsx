import type { JSX } from "react";
import type { MemberRow, SuperAdminLabels } from "../types";
import { UserRow } from "./UserRow";

type UsersTableProps = {
  members: MemberRow[];
  labels: SuperAdminLabels;
  onEnableUser: (userId: string) => void;
  onDisableUser: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
};

export function UsersTable({
  members,
  labels,
  onEnableUser,
  onDisableUser,
  onDeleteUser,
}: UsersTableProps): JSX.Element {
  return (
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
          {members.map((member) => (
            <UserRow
              key={member.user_id}
              member={member}
              labels={labels}
              onEnableUser={onEnableUser}
              onDisableUser={onDisableUser}
              onDeleteUser={onDeleteUser}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

