import { getTranslations } from "next-intl/server";
import type { DocumentsPageLabels } from "@/components/documents/types";

export async function getDocumentsLabels(locale: string): Promise<DocumentsPageLabels> {
  const t = await getTranslations({ locale, namespace: "documentsPage" });

  return {
    title: t("title"),
    subtitle: t("subtitle"),
    ingestionNote: t("ingestionNote"),
    linksChat: t("links.chat"),
    linksProcedures: t("links.procedures"),
    uploadLabel: t("uploadLabel"),
    uploadButton: t("uploadButton"),
    uploading: t("uploading"),
    hintFormats: t("hintFormats"),
    hintSecurity: t("hintSecurity"),
    listTitle: t("listTitle"),
    empty: t("empty"),
    tableHeaders: {
      name: t("table.name"),
      type: t("table.type"),
      status: t("table.status"),
      updated: t("table.updated"),
      actions: t("table.actions"),
    },
    status: {
      pending: t("status.pending"),
      processing: t("status.processing"),
      ingested: t("status.ingested"),
      failed: t("status.failed"),
    },
    delete: {
      label: t("delete.label"),
      confirm: t.raw("delete.confirm") as string,
      cancel: t("delete.cancel"),
    },
    breadcrumbs: {
      home: t("breadcrumbs.home"),
      documents: t("breadcrumbs.documents"),
    },
  };
}

