"use client";

import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AdminUserRow, SuperAdminLabels } from "./types";

type DeleteDialogProps = {
  labels: SuperAdminLabels;
  target: AdminUserRow | null;
  onClose: () => void;
  onConfirm: () => void;
};

function DeleteDialog({ labels, target, onClose, onConfirm }: DeleteDialogProps): JSX.Element {
  return (
    <Dialog open={Boolean(target)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{labels.delete}</DialogTitle>
          <DialogDescription>
            {target ? `${labels.delete}: ${target.email ?? target.id}` : null}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {labels.cancel ?? "Cancel"}
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            {labels.delete}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { DeleteDialog };

