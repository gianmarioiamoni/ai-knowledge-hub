"use client";

import { JSX, useActionState, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { handleGenerateSop } from "@/app/[locale]/procedures/actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type GenerateSopDialogProps = {
  locale: string;
  labels: {
    trigger: string;
    titleLabel: string;
    scopeLabel: string;
    submit: string;
    cancel: string;
    success: string;
    description: string;
    allowFreeLabel: string;
    allowFreeWarning: string;
  };
  action?: typeof handleGenerateSop;
};

type FormState = {
  error?: string;
  success?: string;
};

function GenerateSopDialog({ locale, labels, action = handleGenerateSop }: GenerateSopDialogProps): JSX.Element {
  const [state, formAction] = useActionState<FormState, FormData>(action, {});
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [allowFree, setAllowFree] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      setAllowFree(false);
      setOpen(false);
      toast.success(labels.success);
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state?.success]);

  const handleCancel = () => {
    formRef.current?.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">{labels.trigger}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{labels.trigger}</DialogTitle>
          <DialogDescription>
            {labels.description}
          </DialogDescription>
        </DialogHeader>
        <form
          ref={formRef}
          action={(fd) => {
            startTransition(() => formAction(fd));
          }}
          className="space-y-4"
        >
          <input type="hidden" name="locale" value={locale} />
          <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
            {labels.titleLabel}
            <Input name="title" required minLength={3} disabled={pending} />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
            {labels.scopeLabel}
            <Textarea name="scope" required minLength={5} rows={4} disabled={pending} />
          </label>
          <label className="flex items-start gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              name="allowFree"
              checked={allowFree}
              onChange={(e) => setAllowFree(e.target.checked)}
              disabled={pending}
              className="mt-1"
            />
            <span>
              <span className="font-medium">{labels.allowFreeLabel}</span>
              <br />
              <span className="text-xs text-amber-700">{labels.allowFreeWarning}</span>
            </span>
          </label>
          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="outline" disabled={pending} onClick={handleCancel}>
              {labels.cancel}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? labels.submit + "..." : labels.submit}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { GenerateSopDialog };

