import type { JSX } from "react";
import { DocumentsTableDisplay } from "./DocumentsTableDisplay";
import type { DocumentRow, DocumentsPageLabels } from "./types";

type DocumentsTableProps = {
  locale: string;
  documents: DocumentRow[];
  labels: DocumentsPageLabels;
};

export function DocumentsTable({ locale, documents, labels }: DocumentsTableProps): JSX.Element {
  return <DocumentsTableDisplay locale={locale} documents={documents} labels={labels} />;
}

