"use client";

import { useActionState, useEffect } from "react";
import type { JSX } from "react";
import { changePassword } from "@/app/[locale]/profile/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type ForcePasswordDialogProps = {
  open: boolean;
  locale: string;
  labels: {
    title: string;
    description: string;
    newPassword: string;
    confirmPassword: string;
    submit: string;
    success: string;
    error: string;
  };
};

function ForcePasswordDialog({ open, locale, labels }: ForcePasswordDialogProps): JSX.Element {
  const [state, formAction] = useActionState(changePassword, { error: "", success: "" });

  useEffect(() => {
    if (state?.success) {
      toast.success(labels.success);
      window.location.replace(`/${locale}/dashboard`);
    } else if (state?.error) {
      toast.error(state.error || labels.error);
    }
  }, [labels.error, labels.success, locale, state?.error, state?.success]);

  return (
    <Dialog open={open} onOpenChange={() => {}} modal>
      <DialogContent showCloseButton={false} className="max-w-md">
        <DialogHeader>
          <DialogTitle>{labels.title}</DialogTitle>
          <DialogDescription>{labels.description}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-3">
          <Input name="password" type="password" placeholder={labels.newPassword} required minLength={8} />
          <Input name="confirm" type="password" placeholder={labels.confirmPassword} required minLength={8} />
          <Button type="submit" className="w-full">
            {labels.submit}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { ForcePasswordDialog };

