"use client";

import type { JSX } from "react";
import { StatusBadge } from "./StatusBadge";
import { DeleteDocumentAction } from "./DeleteDocumentAction";
import type { DocumentRow, DocumentsPageLabels } from "./types";
import { formatDate, getDisplayName } from "./helpers";

type DocumentsTableProps = {
  locale: string;
  documents: DocumentRow[];
  labels: DocumentsPageLabels;
};

export function DocumentsTable({ locale, documents, labels }: DocumentsTableProps): JSX.Element {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60">
      <table className="min-w-full divide-y divide-border/80 text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-foreground">
              {labels.tableHeaders.name}
            </th>
            <th className="px-4 py-3 text-left font-semibold text-foreground">
              {labels.tableHeaders.type}
            </th>
            <th className="px-4 py-3 text-left font-semibold text-foreground">
              {labels.tableHeaders.status}
            </th>
            <th className="px-4 py-3 text-left font-semibold text-foreground">
              {labels.tableHeaders.updated}
            </th>
            <th className="px-4 py-3 text-right font-semibold text-foreground">
              {labels.tableHeaders.actions}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/80 bg-background/40">
          {documents.map((doc) => (
            <tr key={doc.id}>
              <td className="px-4 py-3 text-foreground">
                {getDisplayName(doc) ?? doc.file_path}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{doc.file_type}</td>
              <td className="px-4 py-3">
                <StatusBadge status={doc.status} label={labels.status[doc.status]} />
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {formatDate(doc.updated_at, locale)}
              </td>
              <td className="px-4 py-3 text-right">
                <DeleteDocumentAction
                  locale={locale}
                  id={doc.id}
                  labels={{
                    deleteLabel: labels.delete.label,
                    confirmText: labels.delete.confirm.replace(
                      "{title}",
                      getDisplayName(doc) ?? doc.file_path
                    ),
                    cancelLabel: labels.delete.cancel,
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

