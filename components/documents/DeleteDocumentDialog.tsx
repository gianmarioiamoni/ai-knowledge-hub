"use client";

import { useState } from "react";
import { handleDeleteDocument } from "@/app/[locale]/documents/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";

type DeleteDocumentDialogProps = {
  locale: string;
  id: string;
  name: string;
  label: string;
  confirmText: string;
  cancelLabel: string;
};

function DeleteDocumentDialog({
  locale,
  id,
  name,
  label,
  confirmText,
  cancelLabel,
}: DeleteDocumentDialogProps): JSX.Element {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title={label}
          aria-label={label}
          className="text-rose-600 hover:text-rose-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
          <DialogDescription>{confirmText.replace("{title}", name)}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            {cancelLabel}
          </Button>
          <form
            action={async (fd) => {
              await handleDeleteDocument({}, fd);
              setOpen(false);
            }}
          >
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="id" value={id} />
            <Button type="submit" variant="destructive">
              {label}
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { DeleteDocumentDialog };


