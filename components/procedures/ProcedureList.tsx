import { JSX } from "react";
import { Link } from "@/i18n/navigation";

type ProcedureListProps = {
  procedures: Array<{
    id: string;
    title: string;
    created_at: string;
  }>;
  labels: {
    empty: string;
    view: string;
    exportMd: string;
    exportPdf: string;
  };
  locale: string;
};

function ProcedureList({ procedures, labels, locale }: ProcedureListProps): JSX.Element {
  if (procedures.length === 0) {
    return <p className="text-sm text-muted-foreground">{labels.empty}</p>;
  }

  return (
    <div className="divide-y divide-border/70">
      {procedures.map((proc) => (
        <div key={proc.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-base font-semibold text-foreground">{proc.title}</p>
            <p className="text-xs text-muted-foreground">
              {new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(
                new Date(proc.created_at)
              )}
            </p>
          </div>
          <div className="flex gap-2 text-sm">
            <Link
              href={`/procedures/${proc.id}`}
              className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary hover:bg-primary/20"
            >
              {labels.view}
            </Link>
            <a
              href={`/api/procedures/export?id=${proc.id}&format=md`}
              className="rounded-full bg-muted px-3 py-1 font-medium text-foreground hover:bg-muted/80"
            >
              {labels.exportMd}
            </a>
            <a
              href={`/api/procedures/export?id=${proc.id}&format=pdf`}
              className="rounded-full bg-muted px-3 py-1 font-medium text-foreground hover:bg-muted/80"
            >
              {labels.exportPdf}
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

export { ProcedureList };

