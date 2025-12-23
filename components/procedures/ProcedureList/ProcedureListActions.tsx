"use client";

import { JSX } from "react";
import { Link } from "@/i18n/navigation";
import { DeleteConfirmDialog } from "../DeleteConfirmDialog";
import type { ProcedureListActionsProps } from "./types";

function ProcedureListActions({ procedure, labels, locale }: ProcedureListActionsProps): JSX.Element {
  return (
    <>
      <Link
        href={`/procedures/${procedure.id}`}
        className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary hover:bg-primary/20"
      >
        {labels.view}
      </Link>
      <a
        href={`/api/procedures/export?id=${procedure.id}&format=md&locale=${locale}`}
        className="rounded-full bg-muted px-3 py-1 font-medium text-foreground hover:bg-muted/80"
      >
        {labels.exportMd}
      </a>
      <a
        href={`/api/procedures/export?id=${procedure.id}&format=pdf&locale=${locale}`}
        className="rounded-full bg-muted px-3 py-1 font-medium text-foreground hover:bg-muted/80"
      >
        {labels.exportPdf}
      </a>
      <DeleteConfirmDialog
        locale={locale}
        id={procedure.id}
        title={procedure.title}
        label={labels.delete}
        confirmText={labels.confirmDelete ?? labels.delete}
        cancelLabel={labels.cancel}
      />
    </>
  );
}

export { ProcedureListActions };

