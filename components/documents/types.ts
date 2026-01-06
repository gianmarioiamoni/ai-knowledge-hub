export type DocumentRow = {
  id: string;
  file_path: string;
  file_type: string;
  status: "pending" | "processing" | "ingested" | "failed";
  metadata: Record<string, unknown> | null;
  updated_at: string | null;
};

export type DocumentsPageLabels = {
  title: string;
  subtitle: string;
  ingestionNote: string;
  linksChat: string;
  linksProcedures: string;
  uploadLabel: string;
  uploadButton: string;
  uploading: string;
  hintFormats: string;
  hintSecurity: string;
  listTitle: string;
  empty: string;
  tableHeaders: {
    name: string;
    type: string;
    status: string;
    updated: string;
    actions: string;
  };
  status: {
    pending: string;
    processing: string;
    ingested: string;
    failed: string;
  };
  delete: {
    label: string;
    confirm: string;
    cancel: string;
  };
  breadcrumbs: {
    home: string;
    documents: string;
  };
};


