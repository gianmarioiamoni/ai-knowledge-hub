"use client";

import type { JSX } from "react";
import { Card } from "@/components/ui/card";
import { DeleteDialog } from "./SuperAdminPanel/DeleteDialog";
import { Toolbar } from "./SuperAdminPanel/Toolbar";
import { UsersTable } from "./SuperAdminPanel/UsersTable";
import { useSuperAdminUsers } from "./SuperAdminPanel/useSuperAdminUsers";
import type { SuperAdminPanelProps } from "./SuperAdminPanel/types";

function SuperAdminPanel({ labels }: SuperAdminPanelProps): JSX.Element {
  const {
    rows,
    loading,
    message,
    isPending,
    deleteTarget,
    setDeleteTarget,
    handleRefresh,
    handleAction,
  } = useSuperAdminUsers(labels);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 sm:px-8 lg:px-0">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{labels.title}</p>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">{labels.subtitle}</h1>
      </div>

      <Toolbar labels={labels} loading={loading} isPending={isPending} message={message} onRefresh={handleRefresh} />

      <Card className="border border-white/40 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-white/5">
        <UsersTable rows={rows} labels={labels} isPending={isPending} onAction={handleAction} onDelete={setDeleteTarget} />
      </Card>

      <DeleteDialog
        labels={labels}
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            handleAction("delete", deleteTarget.id);
          }
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}

export { SuperAdminPanel };

