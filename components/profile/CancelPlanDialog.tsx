"use client";

import { type JSX, useState, useTransition } from "react";
import { cancelStripeSubscription } from "@/app/[locale]/profile/actions";
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
import { useRouter } from "@/i18n/navigation";

type CancelPlanDialogProps = {
  labels: {
    cta: string;
    title: string;
    description: string;
    warnings: string[];
    confirm: string;
    cancel: string;
    success: string;
    error: string;
  };
};

function CancelPlanDialog({ labels }: CancelPlanDialogProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleConfirm = (): void => {
    setError(null);
    startTransition(async () => {
      const result = await cancelStripeSubscription();
      if (result.error) {
        setError(labels.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="w-fit">
          {labels.cta}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{labels.title}</DialogTitle>
          <DialogDescription>{labels.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 text-sm text-muted-foreground">
          {labels.warnings.map((warning) => (
            <p key={warning} className="leading-5">
              {warning}
            </p>
          ))}
        </div>
        {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
        <DialogFooter className="gap-2 sm:justify-end">
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
            {labels.cancel}
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isPending}>
            {labels.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { CancelPlanDialog };


