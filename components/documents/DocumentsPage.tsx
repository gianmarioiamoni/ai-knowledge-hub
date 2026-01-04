import type { JSX } from "react";
import { Card } from "@/components/ui/card";
import { UploadForm } from "./UploadForm";
import { DocumentsTable } from "./DocumentsTable";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import type { DocumentRow, DocumentsPageLabels } from "./types";
import { LAYOUT_CLASSES } from "@/lib/styles/layout";

type DocumentsPageProps = {
  locale: string;
  documents: DocumentRow[];
  labels: DocumentsPageLabels;
  allowUpload: boolean;
  uploadAction: any;
};

export function DocumentsPage({
  locale,
  documents,
  labels,
  allowUpload,
  uploadAction,
}: DocumentsPageProps): JSX.Element {
  return (
    <div className={LAYOUT_CLASSES.pageContainer}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: labels.breadcrumbs.home, href: `/${locale}/dashboard` },
          { label: labels.breadcrumbs.documents },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          {labels.title}
        </p>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">{labels.subtitle}</h1>
        <p className="text-sm text-muted-foreground">{labels.ingestionNote}</p>
        <div className="flex flex-wrap gap-2 text-sm text-primary">
          <a className="underline-offset-4 hover:underline" href={`/${locale}/chat`}>
            {labels.linksChat}
          </a>
          <span>·</span>
          <a className="underline-offset-4 hover:underline" href={`/${locale}/procedures`}>
            {labels.linksProcedures}
          </a>
        </div>
      </div>

      {/* Upload Form (conditional) */}
      {allowUpload && (
        <Card className="border border-white/40 bg-white/70 p-6 backdrop-blur dark:border-white/10 dark:bg-white/5">
          <UploadForm
            locale={locale}
            labels={{
              uploadLabel: labels.uploadLabel,
              uploadButton: labels.uploadButton,
              uploading: labels.uploading,
              hintFormats: labels.hintFormats,
              hintSecurity: labels.hintSecurity,
            }}
            action={uploadAction}
          />
        </Card>
      )}

      {/* Documents List */}
      <Card className="border border-white/40 bg-white/70 p-6 backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{labels.listTitle}</h2>
          <span className="text-sm text-muted-foreground">{documents.length} docs</span>
        </div>
        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">{labels.empty}</p>
        ) : (
          <DocumentsTable locale={locale} documents={documents} labels={labels} />
        )}
      </Card>
    </div>
  );
}

