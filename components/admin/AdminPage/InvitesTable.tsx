"use client";

import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Trash2, Ban } from "lucide-react";
import { deleteInvite, deleteAllInvites, revokeInvite } from "@/app/[locale]/admin/actions";
import type { InviteRow, AdminLabels } from "./types";
import { getRoleLabel } from "./helpers";

type InvitesTableProps = {
  locale: string;
  invites: InviteRow[];
  currentStatus: string;
  labels: AdminLabels;
  onStatusChange: (value: string) => void;
  bindAction: (action: any) => (formData: FormData) => Promise<any>;
};

export function InvitesTable({
  locale,
  invites,
  currentStatus,
  labels,
  onStatusChange,
  bindAction,
}: InvitesTableProps): JSX.Element {
  return (
    <Card className="p-2 sm:p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-foreground">{labels.invitesTitle}</h3>
        <span className="text-[10px] text-muted-foreground">{invites.length}</span>
      </div>

      {/* Filters */}
      <div className="mb-2 flex flex-col gap-1.5 sm:flex-row">
        <select
          className="h-7 flex-1 rounded-md border border-border bg-background px-1.5 text-[10px]"
          value={currentStatus}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="all">{labels.filterAll}</option>
          <option value="pending">{labels.filterPending}</option>
          <option value="accepted">{labels.filterAccepted}</option>
          <option value="expired">{labels.filterExpired}</option>
          <option value="revoked">{labels.filterRevoked}</option>
        </select>
        <form action={bindAction(deleteAllInvites)}>
          <input type="hidden" name="locale" value={locale} />
          <Button variant="outline" size="sm" type="submit" className="h-7 w-full px-2 text-[10px] sm:w-auto">
            {labels.deleteAllInvites}
          </Button>
        </form>
      </div>

      {/* Table */}
      {invites.length === 0 ? (
        <p className="py-3 text-center text-[10px] text-muted-foreground">{labels.invitesEmpty}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border/60">
          <table className="min-w-full text-[10px]">
            <thead className="bg-muted/50">
              <tr>
                <th className="min-w-[100px] px-1.5 py-1 text-left font-semibold sm:min-w-[130px] sm:px-2">
                  {labels.headers.email}
                </th>
                <th className="min-w-[70px] px-1.5 py-1 text-left font-semibold sm:min-w-[85px] sm:px-2">
                  {labels.headers.role}
                </th>
                <th className="min-w-[55px] px-1.5 py-1 text-left font-semibold sm:min-w-[70px] sm:px-2">
                  {labels.headers.status}
                </th>
                <th className="min-w-[50px] px-1.5 py-1 text-right font-semibold sm:min-w-[60px] sm:px-2">
                  {labels.headers.actions}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 bg-background">
              {invites.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/30">
                  <td className="min-w-[100px] px-1.5 py-1 text-foreground sm:min-w-[130px] sm:px-2">
                    <div className="max-w-[100px] truncate sm:max-w-[130px]" title={inv.email}>
                      {inv.email}
                    </div>
                  </td>
                  <td className="min-w-[70px] px-1.5 py-1 sm:min-w-[85px] sm:px-2">
                    <Badge variant="secondary" className="text-[9px]">
                      {getRoleLabel(inv.role, labels)}
                    </Badge>
                  </td>
                  <td className="min-w-[55px] px-1.5 py-1 sm:min-w-[70px] sm:px-2">
                    <Badge variant={inv.status === "pending" ? "default" : "outline"} className="text-[9px]">
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="min-w-[50px] px-1.5 py-1 sm:min-w-[60px] sm:px-2">
                    <div className="flex justify-end gap-0.5">
                      {inv.status === "pending" && (
                        <form action={bindAction(revokeInvite)}>
                          <input type="hidden" name="locale" value={locale} />
                          <input type="hidden" name="id" value={inv.id} />
                          <Button variant="ghost" size="icon" type="submit" className="size-5 sm:size-6">
                            <Ban className="size-2.5" />
                          </Button>
                        </form>
                      )}
                      <form action={bindAction(deleteInvite)}>
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="id" value={inv.id} />
                        <Button variant="ghost" size="icon" type="submit" className="size-5 sm:size-6">
                          <Trash2 className="size-2.5" />
                        </Button>
                      </form>
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

