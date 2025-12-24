"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AdminUserRow = {
  id: string;
  email: string | null;
  role: string | null;
  banned: boolean;
  createdAt: string | null;
};

type SuperAdminPanelProps = {
  labels: {
    title: string;
    subtitle: string;
    email: string;
    role: string;
    status: string;
    created: string;
    actions: string;
    loading: string;
    refresh: string;
    promote: string;
    demote: string;
    disable: string;
    enable: string;
    delete: string;
    banned: string;
    active: string;
    error: string;
    ok: string;
    cancel?: string;
  };
};

function SuperAdminPanel({ labels }: SuperAdminPanelProps): JSX.Element {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<AdminUserRow | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list" }),
      });
      if (!res.ok) {
        throw new Error(labels.error);
      }
      const json = (await res.json()) as { users: AdminUserRow[] };
      setUsers(json.users ?? []);
    } catch (err) {
      setMessage((err as Error).message || labels.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const handleAction = (action: AdminUserRow["id"] | string, userId?: string) => {
    startTransition(async () => {
      setMessage(null);
      try {
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, userId }),
        });
        if (!res.ok) {
          throw new Error(labels.error);
        }
        setMessage(labels.ok);
        await loadUsers();
      } catch (err) {
        setMessage((err as Error).message || labels.error);
      }
    });
  };

  const rows = useMemo(
    () =>
      users.map((u) => ({
        ...u,
        statusLabel: u.banned ? labels.banned : labels.active,
      })),
    [users, labels.active, labels.banned]
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 sm:px-8 lg:px-0">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{labels.title}</p>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">{labels.subtitle}</h1>
      </div>

      <div className="flex items-center gap-3">
        <Button size="sm" onClick={loadUsers} disabled={loading || isPending}>
          {loading ? labels.loading : labels.refresh}
        </Button>
        {message ? <span className="text-sm text-muted-foreground">{message}</span> : null}
      </div>

      <Card className="border border-white/40 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border/80 text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-foreground">{labels.email}</th>
                <th className="px-3 py-2 text-left font-semibold text-foreground">{labels.role}</th>
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
                  <td className="px-3 py-2 text-muted-foreground">{user.statusLabel}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {user.createdAt ? new Date(user.createdAt).toLocaleString() : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleAction("promote", user.id)}
                        disabled={isPending || (user.role ?? "").toUpperCase() === "ORG_ADMIN"}
                      >
                        {labels.promote}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction("demote", user.id)}
                        disabled={isPending || (user.role ?? "").toUpperCase() !== "ORG_ADMIN"}
                      >
                        {labels.demote}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-amber-500 text-amber-700 hover:bg-amber-50"
                        onClick={() => handleAction(user.banned ? "enable" : "disable", user.id)}
                        disabled={isPending}
                      >
                        {user.banned ? labels.enable : labels.disable}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteTarget(user)}
                        disabled={isPending}
                      >
                        {labels.delete}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-sm text-muted-foreground" colSpan={5}>
                    {loading ? labels.loading : "—"}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{labels.delete}</DialogTitle>
            <DialogDescription>
              {deleteTarget ? `${labels.delete}: ${deleteTarget.email ?? deleteTarget.id}` : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              {labels.cancel ?? "Cancel"}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteTarget) {
                  handleAction("delete", deleteTarget.id);
                }
                setDeleteTarget(null);
              }}
            >
              {labels.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { SuperAdminPanel };

