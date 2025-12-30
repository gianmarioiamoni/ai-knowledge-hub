"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { handleDeleteDocument } from "@/app/[locale]/documents/actions";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { canUploadDocs } from "@/lib/server/roles";

type DeleteDocumentActionProps = {
  locale: string;
  id: string;
  labels: {
    deleteLabel: string;
    confirmText: string;
    cancelLabel: string;
  };
};

function DeleteDocumentAction({ locale, id, labels }: DeleteDocumentActionProps): JSX.Element {
  const [isPending, startTransition] = useTransition();
  const canDelete = canUploadDocs((typeof window !== "undefined" ? (window as any).__userRole : undefined) as any);

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
          const res = await handleDeleteDocument({}, fd);
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
          disabled={isPending || !canDelete}
          className="text-rose-600 hover:text-rose-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      }
    />
  );
}

export { DeleteDocumentAction };


