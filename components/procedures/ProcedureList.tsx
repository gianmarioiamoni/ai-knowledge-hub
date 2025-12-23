"use client";

import { JSX, useState } from "react";
import { Link } from "@/i18n/navigation";
import { handleRenameSop } from "@/app/[locale]/procedures/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Pencil } from "lucide-react";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

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
    delete: string;
    edit: string;
    save: string;
    cancel: string;
    confirmDelete?: string;
  };
  locale: string;
};

function ProcedureList({ procedures, labels, locale }: ProcedureListProps): JSX.Element {
  if (procedures.length === 0) {
    return <p className="text-sm text-muted-foreground">{labels.empty}</p>;
  }

  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="divide-y divide-border/70">
      {procedures.map((proc) => (
        <div key={proc.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            {editingId === proc.id ? (
              <form
                action={async (formData) => {
                  await handleRenameSop(formData);
                  setEditingId(null);
                }}
                className="flex flex-col gap-2 sm:flex-row sm:items-center"
              >
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="id" value={proc.id} />
                <Input
                  name="title"
                  defaultValue={proc.title}
                  className="w-full sm:w-64"
                  required
                  minLength={3}
                />
                <div className="flex gap-2">
                  <Button type="submit" size="sm">
                    {labels.save}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingId(null)}
                  >
                    {labels.cancel}
                  </Button>
                </div>
              </form>
            ) : (
              <p className="text-base font-semibold text-foreground">{proc.title}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(
                new Date(proc.created_at)
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
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
            <DeleteConfirmDialog
              locale={locale}
              id={proc.id}
              title={proc.title}
              label={labels.delete}
              confirmText={labels.confirmDelete ?? labels.delete}
              cancelLabel={labels.cancel}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title={labels.edit}
              aria-label={labels.edit}
              onClick={() => setEditingId(proc.id)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

export { ProcedureList };

