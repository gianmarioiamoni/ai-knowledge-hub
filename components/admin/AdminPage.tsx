"use client";

import { useState, useEffect } from "react";
import type { JSX } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  deleteInvite,
  deleteAllInvites,
  revokeInvite,
  createInvite,
} from "@/app/[locale]/admin/actions";
import {
  changeUserRole,
  deleteUserMembership,
  enableUser,
  suspendUser,
} from "@/app/[locale]/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Trash2, Ban, Check, UserMinus } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

type InviteRow = {
  id: string;
  email: string;
  role: string;
  status: string;
  expires_at: string | null;
  created_at: string | null;
};

type UserRow = {
  id: string;
  email: string | null;
  role: string | null;
  disabled: boolean;
  created_at: string | null;
};

type AdminPageProps = {
  locale: string;
  invites: InviteRow[];
  users: UserRow[];
  labels: {
    title: string;
    invitesTitle: string;
    invitesSubtitle: string;
    usersTitle: string;
    usersSubtitle: string;
    filterAll: string;
    filterPending: string;
    filterAccepted: string;
    filterExpired: string;
    filterRevoked: string;
    revoke: string;
    deleteInvite: string;
    deleteAllInvites: string;
    invitesEmpty?: string;
    inviteFormTitle: string;
    inviteFormEmail: string;
    inviteFormRole: string;
    inviteFormRoleContributor: string;
    inviteFormRoleViewer: string;
    inviteFormSubmit: string;
    inviteFormSuccess: string;
    roles: {
      company: string;
      contributor: string;
      viewer: string;
      COMPANY_ADMIN: string;
      CONTRIBUTOR: string;
      VIEWER: string;
    };
    headers: {
      email: string;
      role: string;
      status: string;
      expires: string;
      created: string;
      actions: string;
    };
    statusActive: string;
    statusSuspended: string;
    suspend: string;
    enable: string;
    deleteUser: string;
    changeRole: string;
    usersEmpty?: string;
    deleteUserConfirmTitle: string;
    deleteUserConfirmDescription: string;
    deleteUserConfirmButton: string;
    cancel: string;
  };
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toISOString().replace("T", " ").slice(0, 16);
}

export function AdminPage({
  locale,
  invites,
  users: initialUsers,
  labels,
}: AdminPageProps): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  // Local state for users to enable optimistic updates
  const [users, setUsers] = useState<UserRow[]>(initialUsers);

  const bindAction =
    (action: (prevState: any, formData: FormData) => Promise<any>) =>
    async (formData: FormData) => {
      const result = await action({}, formData);
      // Refresh the page to show updated data after any successful action
      if (result?.success) {
        router.refresh();
      }
      return result;
    };
  
  // Handle role change with optimistic update
  const handleRoleChange = async (userId: string, newRole: string) => {
    // Optimistic update: update local state immediately
    setUsers((prevUsers) =>
      prevUsers.map((u) =>
        u.id === userId ? { ...u, role: newRole } : u
      )
    );

    // Call server action
    const formData = new FormData();
    formData.append("locale", locale);
    formData.append("userId", userId);
    formData.append("role", newRole);
    const result = await changeUserRole({}, formData);
    
    if (result?.error) {
      toast.error(result.error);
      // Rollback on error
      setUsers(initialUsers);
    } else if (result?.success) {
      toast.success(labels.changeRole);
      // No need to refresh, optimistic update already done
    }
  };

  const handleToggleDisabled = async (userId: string, currentDisabled: boolean) => {
    // Optimistic update
    setUsers((prevUsers) =>
      prevUsers.map((u) =>
        u.id === userId ? { ...u, disabled: !currentDisabled } : u
      )
    );

    const formData = new FormData();
    formData.append("locale", locale);
    formData.append("userId", userId);
    const action = currentDisabled ? enableUser : suspendUser;
    const result = await action({}, formData);
    
    if (result?.error) {
      toast.error(result.error);
      setUsers(initialUsers);
    } else if (result?.success) {
      const label = currentDisabled ? labels.enable : labels.suspend;
      toast.success(label);
      router.refresh();
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const formData = new FormData();
    formData.append("locale", locale);
    formData.append("userId", userId);
    const result = await deleteUserMembership({}, formData);
    
    if (result?.error) {
      toast.error(result.error);
    } else if (result?.success) {
      // Remove from local state
      setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userId));
      toast.success(labels.deleteUser);
      router.refresh();
    }
  };

  const currentStatus = searchParams.get("status") ?? "all";
  const filteredInvites =
    currentStatus === "all"
      ? invites
      : invites.filter((i) => i.status === currentStatus);

  const roleLabel = (role?: string | null) => {
    if (role === "COMPANY_ADMIN") return labels.roles.COMPANY_ADMIN;
    if (role === "VIEWER") return labels.roles.VIEWER;
    return labels.roles.CONTRIBUTOR;
  };

  const roleOptions = (
    <>
      <option value="COMPANY_ADMIN">{labels.roles.COMPANY_ADMIN}</option>
      <option value="CONTRIBUTOR">{labels.roles.CONTRIBUTOR}</option>
      <option value="VIEWER">{labels.roles.VIEWER}</option>
    </>
  );
  
  // Invite form state
  const [inviteState, inviteAction, invitePending] = useActionState(createInvite, {} as any);
  
  useEffect(() => {
    if (!inviteState) return;
    if (inviteState.error) {
      toast.error(inviteState.error);
    } else if (inviteState.success) {
      toast.success(labels.inviteFormSuccess);
      router.refresh();
    }
  }, [inviteState, labels.inviteFormSuccess, router]);

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary sm:text-sm">
          {labels.title}
        </p>
      </div>
      
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        
        {/* LEFT COLUMN: Invites */}
        <div className="space-y-4">
          {/* Invite Form */}
          <Card className="p-3 sm:p-4">
            <h2 className="mb-3 text-sm font-semibold text-foreground sm:text-base">{labels.inviteFormTitle}</h2>
            <form action={inviteAction} className="space-y-3">
              <input type="hidden" name="locale" value={locale} />
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs">{labels.inviteFormEmail}</Label>
                <Input id="email" name="email" type="email" required className="h-8 text-xs sm:h-9 sm:text-sm" />
              </div>
              <div className="flex gap-2">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="role" className="text-xs">{labels.inviteFormRole}</Label>
                  <select
                    id="role"
                    name="role"
                    className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs sm:h-9 sm:px-3 sm:text-sm"
                    defaultValue="CONTRIBUTOR"
                  >
                    <option value="CONTRIBUTOR">{labels.inviteFormRoleContributor}</option>
                    <option value="VIEWER">{labels.inviteFormRoleViewer}</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={invitePending} size="sm" className="h-8 text-xs sm:h-9 sm:text-sm">
                    {labels.inviteFormSubmit}
                  </Button>
                </div>
              </div>
            </form>
          </Card>

          {/* Invites List */}
          <Card className="p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground sm:text-base">{labels.invitesTitle}</h3>
              <span className="text-xs text-muted-foreground">{filteredInvites.length}</span>
            </div>
            
            {/* Filters */}
            <div className="mb-3 flex flex-col gap-2 sm:flex-row">
              <select
                className="h-8 flex-1 rounded-md border border-border bg-background px-2 text-xs"
                value={currentStatus}
                onChange={(e) => {
                  const next = new URLSearchParams(searchParams.toString());
                  if (e.target.value === "all") next.delete("status");
                  else next.set("status", e.target.value);
                  router.replace(`${pathname}?${next.toString()}`);
                }}
              >
                <option value="all">{labels.filterAll}</option>
                <option value="pending">{labels.filterPending}</option>
                <option value="accepted">{labels.filterAccepted}</option>
                <option value="expired">{labels.filterExpired}</option>
                <option value="revoked">{labels.filterRevoked}</option>
              </select>
              <form action={bindAction(deleteAllInvites)}>
                <input type="hidden" name="locale" value={locale} />
                <Button variant="outline" size="sm" type="submit" className="h-8 w-full text-xs sm:w-auto">
                  {labels.deleteAllInvites}
                </Button>
              </form>
            </div>

            {/* Invites Table */}
            {filteredInvites.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground sm:py-6">{labels.invitesEmpty}</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border/60">
                <table className="min-w-full text-xs">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-2 py-1.5 text-left font-semibold sm:px-3 sm:py-2">{labels.headers.email}</th>
                      <th className="px-2 py-1.5 text-left font-semibold sm:px-3 sm:py-2">{labels.headers.role}</th>
                      <th className="px-2 py-1.5 text-left font-semibold sm:px-3 sm:py-2">{labels.headers.status}</th>
                      <th className="px-2 py-1.5 text-right font-semibold sm:px-3 sm:py-2">{labels.headers.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 bg-background">
                    {filteredInvites.map((inv) => (
                      <tr key={inv.id} className="hover:bg-muted/30">
                        <td className="max-w-[120px] truncate px-2 py-1.5 text-foreground sm:max-w-none sm:px-3 sm:py-2">{inv.email}</td>
                        <td className="px-2 py-1.5 sm:px-3 sm:py-2">
                          <Badge variant="secondary" className="text-[10px] sm:text-xs">{roleLabel(inv.role)}</Badge>
                        </td>
                        <td className="px-2 py-1.5 sm:px-3 sm:py-2">
                          <Badge variant={inv.status === "pending" ? "default" : "outline"} className="text-[10px] sm:text-xs">
                            {inv.status}
                          </Badge>
                        </td>
                        <td className="px-2 py-1.5 sm:px-3 sm:py-2">
                          <div className="flex justify-end gap-1">
                            {inv.status === "pending" && (
                              <form action={bindAction(revokeInvite)}>
                                <input type="hidden" name="locale" value={locale} />
                                <input type="hidden" name="id" value={inv.id} />
                                <Button variant="ghost" size="icon" type="submit" className="size-6 sm:size-7">
                                  <Ban className="size-3" />
                                </Button>
                              </form>
                            )}
                            <form action={bindAction(deleteInvite)}>
                              <input type="hidden" name="locale" value={locale} />
                              <input type="hidden" name="id" value={inv.id} />
                              <Button variant="ghost" size="icon" type="submit" className="size-6 sm:size-7">
                                <Trash2 className="size-3" />
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
        </div>

        {/* RIGHT COLUMN: Users */}
        <div className="space-y-4">
          <Card className="p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground sm:text-base">{labels.usersTitle}</h3>
                <p className="text-xs text-muted-foreground">{labels.usersSubtitle}</p>
              </div>
              <span className="text-xs text-muted-foreground">{users.length}</span>
            </div>

            {/* Users Table */}
            {users.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground sm:py-6">{labels.usersEmpty}</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border/60">
                <table className="min-w-full text-xs">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-2 py-1.5 text-left font-semibold sm:px-3 sm:py-2">{labels.headers.email}</th>
                      <th className="px-2 py-1.5 text-left font-semibold sm:px-3 sm:py-2">{labels.headers.role}</th>
                      <th className="px-2 py-1.5 text-left font-semibold sm:px-3 sm:py-2">{labels.headers.status}</th>
                      <th className="px-2 py-1.5 text-right font-semibold sm:px-3 sm:py-2">{labels.headers.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 bg-background">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-muted/30">
                        <td className="max-w-[120px] truncate px-2 py-1.5 text-foreground sm:max-w-none sm:px-3 sm:py-2">{u.email ?? "—"}</td>
                        <td className="px-2 py-1.5 sm:px-3 sm:py-2">
                          <select
                            value={u.role ?? "CONTRIBUTOR"}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="h-7 w-full rounded border border-border bg-background px-1 text-[10px] sm:w-auto sm:px-2 sm:text-xs"
                          >
                            {roleOptions}
                          </select>
                        </td>
                        <td className="px-2 py-1.5 sm:px-3 sm:py-2">
                          <Badge variant={u.disabled ? "destructive" : "default"} className="text-[10px] sm:text-xs">
                            {u.disabled ? labels.statusSuspended : labels.statusActive}
                          </Badge>
                        </td>
                        <td className="px-2 py-1.5 sm:px-3 sm:py-2">
                          <div className="flex justify-end gap-1">
                            <Button 
                              size="icon" 
                              variant="ghost"
                              title={u.disabled ? labels.enable : labels.suspend}
                              onClick={() => handleToggleDisabled(u.id, u.disabled)}
                              className="size-6 sm:size-7"
                            >
                              {u.disabled ? <Check className="size-3" /> : <Ban className="size-3" />}
                            </Button>
                            <ConfirmDialog
                              title={labels.deleteUserConfirmTitle}
                              description={labels.deleteUserConfirmDescription}
                              confirmLabel={labels.deleteUserConfirmButton}
                              cancelLabel={labels.cancel}
                              onConfirm={() => handleDeleteUser(u.id)}
                              trigger={
                                <Button 
                                  size="icon" 
                                  variant="ghost"
                                  title={labels.deleteUser}
                                  className="size-6 sm:size-7"
                                >
                                  <UserMinus className="size-3" />
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
        </div>
      </div>
    </div>
  );
}
