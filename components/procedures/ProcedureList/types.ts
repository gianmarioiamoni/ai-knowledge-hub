import type { JSX } from "react";

export type ProcedureRow = {
  id: string;
  title: string;
  created_at: string;
};

export type ProcedureLabels = {
  empty: string;
  view: string;
  exportMd: string;
  exportPdf: string;
  delete: string;
  edit: string;
  save: string;
  cancel: string;
  confirmDelete?: string;
};

export type ProcedureListRowProps = {
  procedure: ProcedureRow;
  labels: ProcedureLabels;
  locale: string;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onRenamed: () => void;
};

export type ProcedureListActionsProps = {
  procedure: ProcedureRow;
  labels: ProcedureLabels;
  locale: string;
};

