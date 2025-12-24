"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import type { AdminUserRow, SuperAdminLabels } from "./types";

const listUsers = async (): Promise<AdminUserRow[]> => {
  const res = await fetch("/api/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "list" }),
  });
  if (!res.ok) {
    throw new Error("Failed to load users");
  }
  const json = (await res.json()) as { users: AdminUserRow[] };
  return json.users ?? [];
};

const useSuperAdminUsers = (labels: SuperAdminLabels) => {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<AdminUserRow | null>(null);

  const handleRefresh = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const data = await listUsers();
      setUsers(data);
    } catch (err) {
      setMessage((err as Error).message || labels.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void handleRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        await handleRefresh();
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

  return {
    rows,
    loading,
    message,
    isPending,
    deleteTarget,
    setDeleteTarget,
    handleRefresh,
    handleAction,
  };
};

export { useSuperAdminUsers };

