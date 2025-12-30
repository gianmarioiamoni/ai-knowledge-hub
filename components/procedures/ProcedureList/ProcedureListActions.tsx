"use client";

import { JSX } from "react";
import { Link } from "@/i18n/navigation";
import { DeleteProcedureAction } from "../DeleteProcedureAction";
import type { ProcedureListActionsProps } from "./types";

function ProcedureListActions({ procedure, labels, locale }: ProcedureListActionsProps): JSX.Element {
  return (
    <>
      <Link
        href={`/procedures/${procedure.id}`}
        className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary hover:bg-primary/20"
        aria-label={`${labels.view} ${procedure.title}`}
      >
        {labels.view}
      </Link>
      <a
        href={`/api/procedures/export?id=${procedure.id}&format=md&locale=${locale}`}
        className="rounded-full bg-muted px-3 py-1 font-medium text-foreground hover:bg-muted/80"
        aria-label={`${labels.exportMd} ${procedure.title}`}
      >
        {labels.exportMd}
      </a>
      <a
        href={`/api/procedures/export?id=${procedure.id}&format=pdf&locale=${locale}`}
        className="rounded-full bg-muted px-3 py-1 font-medium text-foreground hover:bg-muted/80"
        aria-label={`${labels.exportPdf} ${procedure.title}`}
      >
        {labels.exportPdf}
      </a>
      <DeleteProcedureAction
        locale={locale}
        id={procedure.id}
        title={procedure.title}
        labels={{
          deleteLabel: labels.delete,
          confirmText: (labels.confirmDelete ?? labels.delete).replace("{title}", procedure.title),
          cancelLabel: labels.cancel,
        }}
      />
    </>
  );
}

export { ProcedureListActions };

