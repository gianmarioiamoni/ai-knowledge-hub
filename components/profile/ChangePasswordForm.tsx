"use client";

import { useActionState, useEffect } from "react";
import type { JSX } from "react";
import { changePassword } from "@/app/[locale]/profile/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type ChangePasswordFormProps = {
  labels: {
    title: string;
    newPassword: string;
    confirmPassword: string;
    submit: string;
    success: string;
    error: string;
  };
};

function ChangePasswordForm({ labels }: ChangePasswordFormProps): JSX.Element {
  const [state, formAction] = useActionState(changePassword, { error: "", success: "" });

  useEffect(() => {
    if (state?.success) {
      toast.success(labels.success);
    } else if (state?.error) {
      toast.error(state.error || labels.error);
    }
  }, [labels.error, labels.success, state?.error, state?.success]);

  return (
    <div className="rounded-2xl border border-border/60 bg-white/70 p-6 shadow-sm backdrop-blur dark:bg-white/5">
      <div className="flex flex-col gap-2">
        <h2 className="text-base font-semibold text-foreground">{labels.title}</h2>
        <form action={formAction} className="flex flex-col gap-3 max-w-md">
          <Input name="password" type="password" placeholder={labels.newPassword} required minLength={8} />
          <Input name="confirm" type="password" placeholder={labels.confirmPassword} required minLength={8} />
          <div className="flex items-center gap-3">
            <Button type="submit">{labels.submit}</Button>
            {state?.success ? <span className="text-sm text-emerald-600">{labels.success}</span> : null}
            {state?.error ? <span className="text-sm text-rose-600">{state.error || labels.error}</span> : null}
          </div>
        </form>
      </div>
    </div>
  );
}

export { ChangePasswordForm };

