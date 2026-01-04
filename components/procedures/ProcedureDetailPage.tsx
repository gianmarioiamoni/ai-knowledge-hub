import type { JSX } from "react";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { MarkdownContent } from "./MarkdownContent";
import type { ProcedurePageLabels } from "./types";
import { LAYOUT_CLASSES } from "@/lib/styles/layout";

type ProcedureDetailPageProps = {
  title: string;
  content: string;
  createdAt: string;
  labels: ProcedurePageLabels;
};

export function ProcedureDetailPage({
  title,
  content,
  createdAt,
  labels,
}: ProcedureDetailPageProps): JSX.Element {
  return (
    <div className={LAYOUT_CLASSES.pageContainer}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: labels.breadcrumbsHome, href: "/dashboard" },
          { label: labels.breadcrumbsProcedures, href: "/procedures" },
          { label: title },
        ]}
      />

      {/* Back Button */}
      <div className="flex justify-end">
        <Link
          href="/procedures"
          className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-foreground hover:bg-muted/80"
        >
          ← {labels.breadcrumbsProcedures}
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          {labels.title}
        </p>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">{title}</h1>
        <p className="text-sm text-muted-foreground">{createdAt}</p>
      </div>

      {/* Content Card */}
      <Card className="border border-white/40 bg-white/70 p-6 backdrop-blur dark:border-white/10 dark:bg-white/5">
        <MarkdownContent content={content} />
      </Card>
    </div>
  );
}

