import { getTranslations } from "next-intl/server";
import type { ProcedurePageLabels } from "@/components/procedures/types";
import type { ProceduresPageLabels } from "@/components/procedures/proceduresPageTypes";

export async function getProcedureLabels(locale: string): Promise<ProcedurePageLabels> {
  const t = await getTranslations({ locale, namespace: "proceduresPage" });

  return {
    title: t("title"),
    breadcrumbsHome: t("breadcrumbs.home"),
    breadcrumbsProcedures: t("breadcrumbs.procedures"),
  };
}

export async function getProceduresListLabels(locale: string): Promise<ProceduresPageLabels> {
  const t = await getTranslations({ locale, namespace: "proceduresPage" });

  return {
    title: t("title"),
    subtitle: t("subtitle"),
    description: t("description"),
    breadcrumbsHome: t("breadcrumbs.home"),
    breadcrumbsProcedures: t("breadcrumbs.procedures"),
    generate: t("generate"),
    listTitle: t("listTitle"),
    formTitleLabel: t("form.titleLabel"),
    formScopeLabel: t("form.scopeLabel"),
    formSubmit: t("form.submit"),
    formCancel: t("form.cancel"),
    formSuccess: t("form.success"),
    formDescription: t("form.description"),
    formAllowFreeLabel: t("form.allowFreeLabel"),
    formAllowFreeWarning: t("form.allowFreeWarning"),
    listEmpty: t("empty"),
    listView: t("actions.view"),
    listExportMd: t("actions.exportMd"),
    listExportPdf: t("actions.exportPdf"),
    listDelete: t("actions.delete"),
    listConfirmDelete: t.raw("actions.confirmDelete") as string,
    listEdit: t("actions.edit"),
    listSave: t("actions.save"),
    listCancel: t("actions.cancel"),
  };
}

