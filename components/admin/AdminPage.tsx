"use client";

import type { JSX } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  deleteInvite,
  deleteAllInvites,
  revokeInvite,
} from "@/app/[locale]/invites/actions";
import {
  changeUserRole,
  deleteUserMembership,
  enableUser,
  suspendUser,
} from "@/app/[locale]/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Shield, Trash2, Ban, Check, UserMinus } from "lucide-react";

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
    roles: {
      company: string;
      contributor: string;
      viewer: string;
    };
    suspend: string;
    enable: string;
    deleteUser: string;
    changeRole: string;
    usersEmpty?: string;
  };
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

export function AdminPage({
  locale,
  invites,
  users,
  labels,
}: AdminPageProps): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentStatus = searchParams.get("status") ?? "all";
  const filteredInvites =
    currentStatus === "all"
      ? invites
      : invites.filter((i) => i.status === currentStatus);

  const roleLabel = (role?: string | null) => {
    if (role === "COMPANY_ADMIN") return labels.roles.company;
    if (role === "VIEWER") return labels.roles.viewer;
    return labels.roles.contributor;
  };

  const roleOptions = (
    <>
      <option value="COMPANY_ADMIN">{labels.roles.company}</option>
      <option value="CONTRIBUTOR">{labels.roles.contributor}</option>
      <option value="VIEWER">{labels.roles.viewer}</option>
    </>
  );

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          {labels.title}
        </p>
      </div>

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
              <form action={deleteAllInvites}>
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
                <th className="px-3 py-2 font-semibold">Email</th>
                <th className="px-3 py-2 font-semibold">Role</th>
                <th className="px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2 font-semibold">Expires</th>
                <th className="px-3 py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvites.map((invite) => (
                <tr key={invite.id} className="border-t border-border/40">
                  <td className="px-3 py-2">{invite.email}</td>
                  <td className="px-3 py-2">{invite.role}</td>
                  <td className="px-3 py-2">
                    <Badge variant="secondary">{invite.status}</Badge>
                  </td>
                  <td className="px-3 py-2">{formatDate(invite.expires_at)}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <form action={revokeInvite}>
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="id" value={invite.id} />
                        <Button size="icon" variant="outline" title={labels.revoke}>
                          <Ban className="size-4" />
                        </Button>
                      </form>
                      <form action={deleteInvite}>
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
                <th className="px-3 py-2 font-semibold">Email</th>
                <th className="px-3 py-2 font-semibold">Role</th>
                <th className="px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2 font-semibold">Created</th>
                <th className="px-3 py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-border/40">
                  <td className="px-3 py-2">{u.email ?? "—"}</td>
                  <td className="px-3 py-2">
                    <form action={changeUserRole} className="flex items-center gap-2">
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="userId" value={u.id} />
                      <select
                        name="role"
                        defaultValue={u.role ?? "CONTRIBUTOR"}
                        className="rounded-md border border-border bg-background px-2 py-1 text-sm"
                      >
                        {roleOptions}
                      </select>
                      <Button size="icon" variant="outline" title={labels.changeRole}>
                        <Shield className="size-4" />
                      </Button>
                    </form>
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant={u.disabled ? "destructive" : "secondary"}>
                      {u.disabled ? "Suspended" : "Active"}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">{formatDate(u.created_at)}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <form action={u.disabled ? enableUser : suspendUser}>
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="userId" value={u.id} />
                        <Button size="icon" variant="outline" title={u.disabled ? labels.enable : labels.suspend}>
                          {u.disabled ? <Check className="size-4" /> : <Ban className="size-4" />}
                        </Button>
                      </form>
                      <form action={deleteUserMembership}>
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="userId" value={u.id} />
                        <Button size="icon" variant="outline" title={labels.deleteUser}>
                          <UserMinus className="size-4" />
                        </Button>
                      </form>
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

