import { getTranslations } from "next-intl/server";
import type { ProcedurePageLabels } from "@/components/procedures/types";

export async function getProcedureLabels(locale: string): Promise<ProcedurePageLabels> {
  const t = await getTranslations({ locale, namespace: "proceduresPage" });

  return {
    title: t("title"),
    breadcrumbsHome: t("breadcrumbs.home"),
    breadcrumbsProcedures: t("breadcrumbs.procedures"),
  };
}

