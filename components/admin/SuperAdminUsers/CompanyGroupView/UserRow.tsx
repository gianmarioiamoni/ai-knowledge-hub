import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import type { MemberRow, SuperAdminLabels } from "../types";
import { getUserDisplayName } from "./helpers";

type UserRowProps = {
  member: MemberRow;
  labels: SuperAdminLabels;
  onEnableUser: (userId: string) => void;
  onDisableUser: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
};

export function UserRow({
  member,
  labels,
  onEnableUser,
  onDisableUser,
  onDeleteUser,
}: UserRowProps): JSX.Element {
  return (
    <tr className={member.is_demo_user ? "bg-blue-50/30" : ""}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-foreground">
            {getUserDisplayName(member.email, member.user_id)}
          </span>
          {member.is_demo_user && (
            <Badge variant="secondary" className="text-xs">
              DEMO
            </Badge>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-muted-foreground">{member.role}</td>
      <td className="px-4 py-3 text-muted-foreground">
        {member.disabled ? labels.status.disabled : labels.status.active}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-2">
          {member.disabled ? (
            <Button size="sm" variant="secondary" onClick={() => onEnableUser(member.user_id)}>
              {labels.actions.enable}
            </Button>
          ) : (
            <ConfirmDialog
              title={labels.actions.disableUserTitle}
              description={labels.actions.disableUserDesc}
              confirmLabel={labels.actions.disable}
              cancelLabel={labels.actions.cancel}
              onConfirm={() => onDisableUser(member.user_id)}
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
            onConfirm={() => onDeleteUser(member.user_id)}
            trigger={
              <Button size="sm" variant="destructive">
                {labels.actions.delete}
              </Button>
            }
          />
        </div>
      </td>
    </tr>
  );
}

