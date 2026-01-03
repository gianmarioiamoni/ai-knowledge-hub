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
import { Shield, Trash2, Ban, Check, UserMinus } from "lucide-react";
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
      // Revert optimistic update on error
      setUsers(initialUsers);
      toast.error(result.error);
    } else if (result?.success) {
      toast.success(labels.changeRole);
      // Refresh to get fresh data from server in background
      router.refresh();
    }
  };
  
  // Handle suspend/enable with optimistic update
  const handleToggleDisabled = async (userId: string, currentlyDisabled: boolean) => {
    // Optimistic update
    setUsers((prevUsers) =>
      prevUsers.map((u) =>
        u.id === userId ? { ...u, disabled: !currentlyDisabled } : u
      )
    );

    const formData = new FormData();
    formData.append("locale", locale);
    formData.append("userId", userId);
    
    const action = currentlyDisabled ? enableUser : suspendUser;
    const result = await action({}, formData);
    
    if (result?.error) {
      // Revert on error
      setUsers(initialUsers);
      toast.error(result.error);
    } else if (result?.success) {
      toast.success(currentlyDisabled ? labels.enable : labels.suspend);
      router.refresh();
    }
  };
  
  // Handle delete user
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
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          {labels.title}
        </p>
      </div>
      
      {/* Invite Form */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">{labels.inviteFormTitle}</h2>
        <form action={inviteAction} className="grid gap-4 sm:grid-cols-3">
          <input type="hidden" name="locale" value={locale} />
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="email">{labels.inviteFormEmail}</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="role">{labels.inviteFormRole}</Label>
            <select
              id="role"
              name="role"
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              defaultValue="CONTRIBUTOR"
            >
              <option value="CONTRIBUTOR">{labels.inviteFormRoleContributor}</option>
              <option value="VIEWER">{labels.inviteFormRoleViewer}</option>
            </select>
          </div>
          <div className="sm:col-span-3 flex justify-end">
            <Button type="submit" disabled={invitePending}>
              {labels.inviteFormSubmit}
            </Button>
          </div>
        </form>
      </Card>

      {/* Invites */}
      <div className="space-y-3 rounded-2xl border border-border/60 bg-white/70 p-6 shadow-sm backdrop-blur dark:bg-white/5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {labels.invitesTitle}
            </h2>
            <p className="text-sm text-muted-foreground">
              {labels.invitesSubtitle}
            </p>
          </div>
          <div className="flex items-center gap-3">
              <select
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
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
                <Button variant="outline" size="sm" type="submit">
                {labels.deleteAllInvites}
              </Button>
            </form>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-border/60">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-3 py-2 font-semibold">
                  {labels.headers.email}
                </th>
                <th className="px-3 py-2 font-semibold">
                  {labels.headers.role}
                </th>
                <th className="px-3 py-2 font-semibold">
                  {labels.headers.status}
                </th>
                <th className="px-3 py-2 font-semibold">
                  {labels.headers.expires}
                </th>
                <th className="px-3 py-2 font-semibold">
                  {labels.headers.actions}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredInvites.map((invite) => (
                <tr key={invite.id} className="border-t border-border/40">
                  <td className="px-3 py-2">{invite.email}</td>
                  <td className="px-3 py-2">
                    {roleLabel(invite.role)}
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant="secondary">
                      {invite.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">{formatDate(invite.expires_at)}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <form action={bindAction(revokeInvite)}>
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="id" value={invite.id} />
                        <Button size="icon" variant="outline" title={labels.revoke}>
                          <Ban className="size-4" />
                        </Button>
                      </form>
                      <form action={bindAction(deleteInvite)}>
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="id" value={invite.id} />
                        <Button size="icon" variant="outline" title={labels.deleteInvite}>
                          <Trash2 className="size-4" />
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredInvites.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-muted-foreground" colSpan={5}>
                    {labels.invitesEmpty ?? "No invites."}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users */}
      <div className="space-y-3 rounded-2xl border border-border/60 bg-white/70 p-6 shadow-sm backdrop-blur dark:bg-white/5">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-foreground">{labels.usersTitle}</h2>
          <p className="text-sm text-muted-foreground">{labels.usersSubtitle}</p>
        </div>
        <div className="overflow-hidden rounded-xl border border-border/60">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-3 py-2 font-semibold">
                  {labels.headers.email}
                </th>
                <th className="px-3 py-2 font-semibold">
                  {labels.headers.role}
                </th>
                <th className="px-3 py-2 font-semibold">
                  {labels.headers.status}
                </th>
                <th className="px-3 py-2 font-semibold">
                  {labels.headers.created}
                </th>
                <th className="px-3 py-2 font-semibold">
                  {labels.headers.actions}
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-border/40">
                  <td className="px-3 py-2">{u.email ?? "—"}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <select
                        value={u.role ?? "CONTRIBUTOR"}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="rounded-md border border-border bg-background px-2 py-1 text-sm"
                      >
                        {roleOptions}
                      </select>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant={u.disabled ? "destructive" : "secondary"}>
                      {u.disabled ? labels.statusSuspended : labels.statusActive}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">{formatDate(u.created_at)}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Button 
                        size="icon" 
                        variant="outline" 
                        title={u.disabled ? labels.enable : labels.suspend}
                        onClick={() => handleToggleDisabled(u.id, u.disabled)}
                      >
                        {u.disabled ? <Check className="size-4" /> : <Ban className="size-4" />}
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
                            variant="outline" 
                            title={labels.deleteUser}
                          >
                            <UserMinus className="size-4" />
                          </Button>
                        }
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-muted-foreground" colSpan={5}>
                    {labels.usersEmpty ?? "No users."}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

