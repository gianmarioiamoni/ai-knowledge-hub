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
    <div className="mx-auto min-h-screen max-w-7xl px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
      {/* Header */}
      <div className="mb-3 sm:mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary sm:text-xs">
          {labels.title}
        </p>
      </div>
      
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
        
        {/* LEFT COLUMN: Invites */}
        <div className="space-y-3">
          {/* Invite Form */}
          <Card className="p-2 sm:p-3">
            <h2 className="mb-2 text-xs font-semibold text-foreground">{labels.inviteFormTitle}</h2>
            <form action={inviteAction} className="space-y-2">
              <input type="hidden" name="locale" value={locale} />
              <div className="space-y-1">
                <Label htmlFor="email" className="text-[10px]">{labels.inviteFormEmail}</Label>
                <Input id="email" name="email" type="email" required className="h-7 text-[11px]" />
              </div>
              <div className="flex gap-1.5">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="role" className="text-[10px]">{labels.inviteFormRole}</Label>
                  <select
                    id="role"
                    name="role"
                    className="h-7 w-full rounded-md border border-input bg-background px-2 text-[11px]"
                    defaultValue="CONTRIBUTOR"
                  >
                    <option value="CONTRIBUTOR">{labels.inviteFormRoleContributor}</option>
                    <option value="VIEWER">{labels.inviteFormRoleViewer}</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={invitePending} size="sm" className="h-7 px-2 text-[10px]">
                    {labels.inviteFormSubmit}
                  </Button>
                </div>
              </div>
            </form>
          </Card>

          {/* Invites List */}
          <Card className="p-2 sm:p-3">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-foreground">{labels.invitesTitle}</h3>
              <span className="text-[10px] text-muted-foreground">{filteredInvites.length}</span>
            </div>
            
            {/* Filters */}
            <div className="mb-2 flex flex-col gap-1.5 sm:flex-row">
              <select
                className="h-7 flex-1 rounded-md border border-border bg-background px-1.5 text-[10px]"
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
                <Button variant="outline" size="sm" type="submit" className="h-7 w-full px-2 text-[10px] sm:w-auto">
                  {labels.deleteAllInvites}
                </Button>
              </form>
            </div>

            {/* Invites Table */}
            {filteredInvites.length === 0 ? (
              <p className="py-3 text-center text-[10px] text-muted-foreground">{labels.invitesEmpty}</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border/60">
                <table className="min-w-full text-[10px]">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="min-w-[100px] px-1.5 py-1 text-left font-semibold sm:min-w-[130px] sm:px-2">{labels.headers.email}</th>
                      <th className="min-w-[70px] px-1.5 py-1 text-left font-semibold sm:min-w-[85px] sm:px-2">{labels.headers.role}</th>
                      <th className="min-w-[55px] px-1.5 py-1 text-left font-semibold sm:min-w-[70px] sm:px-2">{labels.headers.status}</th>
                      <th className="min-w-[50px] px-1.5 py-1 text-right font-semibold sm:min-w-[60px] sm:px-2">{labels.headers.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 bg-background">
                    {filteredInvites.map((inv) => (
                      <tr key={inv.id} className="hover:bg-muted/30">
                        <td className="min-w-[100px] px-1.5 py-1 text-foreground sm:min-w-[130px] sm:px-2">
                          <div className="max-w-[100px] truncate sm:max-w-[130px]" title={inv.email}>{inv.email}</div>
                        </td>
                        <td className="min-w-[70px] px-1.5 py-1 sm:min-w-[85px] sm:px-2">
                          <Badge variant="secondary" className="text-[9px]">{roleLabel(inv.role)}</Badge>
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
        </div>

        {/* RIGHT COLUMN: Users */}
        <div className="space-y-3">
          <Card className="p-2 sm:p-3">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-foreground">{labels.usersTitle}</h3>
                <p className="text-[10px] text-muted-foreground">{labels.usersSubtitle}</p>
              </div>
              <span className="text-[10px] text-muted-foreground">{users.length}</span>
            </div>

            {/* Users Table */}
            {users.length === 0 ? (
              <p className="py-3 text-center text-[10px] text-muted-foreground">{labels.usersEmpty}</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border/60">
                <table className="min-w-full text-[10px]">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="min-w-[100px] px-1.5 py-1 text-left font-semibold sm:min-w-[130px] sm:px-2">{labels.headers.email}</th>
                      <th className="min-w-[85px] px-1.5 py-1 text-left font-semibold sm:min-w-[100px] sm:px-2">{labels.headers.role}</th>
                      <th className="min-w-[55px] px-1.5 py-1 text-left font-semibold sm:min-w-[70px] sm:px-2">{labels.headers.status}</th>
                      <th className="min-w-[55px] px-1.5 py-1 text-right font-semibold sm:min-w-[65px] sm:px-2">{labels.headers.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 bg-background">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-muted/30">
                        <td className="min-w-[100px] px-1.5 py-1 text-foreground sm:min-w-[130px] sm:px-2">
                          <div className="max-w-[100px] truncate sm:max-w-[130px]" title={u.email ?? "—"}>{u.email ?? "—"}</div>
                        </td>
                        <td className="min-w-[85px] px-1.5 py-1 sm:min-w-[100px] sm:px-2">
                          <select
                            value={u.role ?? "CONTRIBUTOR"}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
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
                              onClick={() => handleToggleDisabled(u.id, u.disabled)}
                              className="size-5 sm:size-6"
                            >
                              {u.disabled ? <Check className="size-2.5" /> : <Ban className="size-2.5" />}
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
                                  className="size-5 sm:size-6"
                                >
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
          </Card>
        </div>
      </div>
    </div>
  );
}
