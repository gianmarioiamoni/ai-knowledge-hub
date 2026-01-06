// Extend existing types
export type ProcedureRow = {
  id: string;
  title: string;
  content: string;
  source_documents: string[];
  created_at: string;
};

export type ProceduresPageLabels = {
  title: string;
  subtitle: string;
  description: string;
  breadcrumbsHome: string;
  breadcrumbsProcedures: string;
  generate: string;
  listTitle: string;
  formTitleLabel: string;
  formScopeLabel: string;
  formSubmit: string;
  formCancel: string;
  formSuccess: string;
  formDescription: string;
  formAllowFreeLabel: string;
  formAllowFreeWarning: string;
  listEmpty: string;
  listView: string;
  listExportMd: string;
  listExportPdf: string;
  listDelete: string;
  listConfirmDelete: string;
  listEdit: string;
  listSave: string;
  listCancel: string;
};


