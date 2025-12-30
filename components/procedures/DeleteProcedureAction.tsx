"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { handleDeleteSop } from "@/app/[locale]/procedures/actions";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

type DeleteProcedureActionProps = {
  locale: string;
  id: string;
  title: string;
  labels: {
    deleteLabel: string;
    confirmText: string;
    cancelLabel: string;
  };
};

function DeleteProcedureAction({ locale, id, title, labels }: DeleteProcedureActionProps): JSX.Element {
  const [isPending, startTransition] = useTransition();

  return (
    <ConfirmDialog
      title={labels.deleteLabel}
      description={labels.confirmText}
      confirmLabel={labels.deleteLabel}
      cancelLabel={labels.cancelLabel}
      onConfirm={() =>
        startTransition(async () => {
          const fd = new FormData();
          fd.append("locale", locale);
          fd.append("id", id);
          const res = await handleDeleteSop(fd);
          if (res?.error) {
            toast.error(res.error);
          } else {
            toast.success(labels.deleteLabel);
          }
        })
      }
      trigger={
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title={labels.deleteLabel}
          aria-label={labels.deleteLabel}
          disabled={isPending}
          className="text-rose-600 hover:text-rose-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      }
    />
  );
}

export { DeleteProcedureAction };


