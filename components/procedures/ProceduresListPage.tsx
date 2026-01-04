import type { JSX } from "react";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { Card } from "@/components/ui/card";
import { ProcedureList } from "./ProcedureList";
import { GenerateSopDialog } from "./GenerateSopDialog";
import type { ProcedureRow, ProceduresPageLabels } from "./proceduresPageTypes";
import { LAYOUT_CLASSES } from "@/lib/styles/layout";

type ProceduresListPageProps = {
  locale: string;
  procedures: ProcedureRow[];
  labels: ProceduresPageLabels;
  allowGenerate: boolean;
  generateAction: any;
};

export function ProceduresListPage({
  locale,
  procedures,
  labels,
  allowGenerate,
  generateAction,
}: ProceduresListPageProps): JSX.Element {
  return (
    <div className={LAYOUT_CLASSES.pageContainer}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: labels.breadcrumbsHome, href: `/${locale}/dashboard` },
          { label: labels.breadcrumbsProcedures },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          {labels.title}
        </p>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">{labels.subtitle}</h1>
        <p className="text-sm text-muted-foreground">{labels.description}</p>
      </div>

      {/* Generate Button (conditional) */}
      {allowGenerate && (
        <div className="flex justify-end">
          <GenerateSopDialog
            locale={locale}
            labels={{
              trigger: labels.generate,
              titleLabel: labels.formTitleLabel,
              scopeLabel: labels.formScopeLabel,
              submit: labels.formSubmit,
              cancel: labels.formCancel,
              success: labels.formSuccess,
              description: labels.formDescription,
              allowFreeLabel: labels.formAllowFreeLabel,
              allowFreeWarning: labels.formAllowFreeWarning,
            }}
            action={generateAction}
          />
        </div>
      )}

      {/* Procedures List Card */}
      <Card className="border border-white/40 bg-white/70 p-6 backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{labels.listTitle}</h2>
          <span className="text-sm text-muted-foreground">{procedures.length} SOP</span>
        </div>
        <ProcedureList
          procedures={procedures}
          labels={{
            empty: labels.listEmpty,
            view: labels.listView,
            exportMd: labels.listExportMd,
            exportPdf: labels.listExportPdf,
            delete: labels.listDelete,
            confirmDelete: labels.listConfirmDelete,
            edit: labels.listEdit,
            save: labels.listSave,
            cancel: labels.listCancel,
          }}
          locale={locale}
        />
      </Card>
    </div>
  );
}

