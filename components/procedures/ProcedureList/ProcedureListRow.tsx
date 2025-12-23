"use client";

import { JSX } from "react";
import { handleRenameSop } from "@/app/[locale]/procedures/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";
import { ProcedureListActions } from "./ProcedureListActions";
import type { ProcedureListRowProps } from "./types";

function ProcedureListRow({
  procedure,
  labels,
  locale,
  isEditing,
  onEdit,
  onCancel,
  onRenamed,
}: ProcedureListRowProps): JSX.Element {
  return (
    <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        {isEditing ? (
          <form
            action={async (formData) => {
              await handleRenameSop(formData);
              onRenamed();
            }}
            className="flex flex-col gap-2 sm:flex-row sm:items-center"
          >
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="id" value={procedure.id} />
            <Input
              name="title"
              defaultValue={procedure.title}
              className="w-full sm:w-64"
              required
              minLength={3}
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm">
                {labels.save}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={onCancel}>
                {labels.cancel}
              </Button>
            </div>
          </form>
        ) : (
          <p className="text-base font-semibold text-foreground">{procedure.title}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(
            new Date(procedure.created_at)
          )}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <ProcedureListActions procedure={procedure} labels={labels} locale={locale} />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title={labels.edit}
          aria-label={labels.edit}
          onClick={onEdit}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export { ProcedureListRow };

