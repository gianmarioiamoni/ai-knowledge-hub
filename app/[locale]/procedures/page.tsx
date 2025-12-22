import { getTranslations } from "next-intl/server";
import { JSX } from "react";
import { ensureUserOrganization } from "@/lib/server/organizations";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import { createSupabaseServiceClient } from "@/lib/server/supabaseService";
import { handleGenerateSop } from "./actions";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { Card } from "@/components/ui/card";
import { ProcedureList } from "@/components/procedures/ProcedureList";
import { GenerateSopDialog } from "@/components/procedures/GenerateSopDialog";

type ProcedureRow = {
  id: string;
  title: string;
  content: string;
  source_documents: string[];
  created_at: string;
};

export default async function ProceduresPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<JSX.Element> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "proceduresPage" });

  const supabase = createSupabaseServerClient();
  const service = createSupabaseServiceClient();
  const organizationId = await ensureUserOrganization({ supabase });

  const { data: procedures } = await service
    .from("procedures")
    .select("id,title,content,source_documents,created_at")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  const rows: ProcedureRow[] = (procedures ?? []) as ProcedureRow[];

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-0">
      <Breadcrumbs
        items={[
          { label: t("breadcrumbs.home"), href: "/dashboard" },
          { label: t("breadcrumbs.procedures") },
        ]}
      />

      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          {t("title")}
        </p>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">{t("subtitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <div className="flex justify-end">
        <GenerateSopDialog
          locale={locale}
          labels={{
            trigger: t("generate"),
            titleLabel: t("form.titleLabel"),
            scopeLabel: t("form.scopeLabel"),
            submit: t("form.submit"),
            cancel: t("form.cancel"),
            success: t("form.success"),
          }}
          action={handleGenerateSop}
        />
      </div>

      <Card className="border border-white/40 bg-white/70 p-6 backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{t("listTitle")}</h2>
          <span className="text-sm text-muted-foreground">{rows.length} SOP</span>
        </div>
        <ProcedureList
          procedures={rows}
          labels={{
            empty: t("empty"),
            view: t("actions.view"),
            exportMd: t("actions.exportMd"),
            exportPdf: t("actions.exportPdf"),
          }}
          locale={locale}
        />
      </Card>
    </div>
  );
}

