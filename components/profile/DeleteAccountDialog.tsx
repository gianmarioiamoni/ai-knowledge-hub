"use client";

import { useState, useTransition } from "react";
import type { JSX } from "react";
import { deleteAccount } from "@/app/[locale]/profile/actions";
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

type DeleteAccountDialogProps = {
  labels: {
    title: string;
    description: string;
    confirm: string;
    cancel: string;
    success: string;
    error: string;
    confirmLabel: string;
  };
};

function DeleteAccountDialog({ labels }: DeleteAccountDialogProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      setMessage(null);
      const res = await deleteAccount();
      if (res?.error) {
        setMessage(res.error || labels.error);
      } else {
        setMessage(labels.success);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="w-auto">
          {labels.title}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{labels.title}</DialogTitle>
          <DialogDescription>{labels.description}</DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{labels.confirmLabel}</p>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            {labels.cancel}
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {labels.confirm}
          </Button>
        </DialogFooter>
        {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
      </DialogContent>
    </Dialog>
  );
}

export { DeleteAccountDialog };

