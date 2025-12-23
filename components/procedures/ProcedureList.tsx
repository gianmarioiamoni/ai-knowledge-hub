"use client";

import { JSX, useState } from "react";
import { Link } from "@/i18n/navigation";
import { ProcedureListRow } from "./ProcedureList/ProcedureListRow";
import type { ProcedureLabels, ProcedureRow } from "./ProcedureList/types";

type ProcedureListProps = {
  procedures: ProcedureRow[];
  labels: ProcedureLabels;
  locale: string;
};

function ProcedureList({ procedures, labels, locale }: ProcedureListProps): JSX.Element {
  if (procedures.length === 0) {
    return <p className="text-sm text-muted-foreground">{labels.empty}</p>;
  }

  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="divide-y divide-border/70">
      {procedures.map((proc) => (
        <ProcedureListRow
          key={proc.id}
          procedure={proc}
          labels={labels}
          locale={locale}
          isEditing={editingId === proc.id}
          onEdit={() => setEditingId(proc.id)}
          onCancel={() => setEditingId(null)}
          onRenamed={() => setEditingId(null)}
        />
      ))}
    </div>
  );
}

export { ProcedureList };

