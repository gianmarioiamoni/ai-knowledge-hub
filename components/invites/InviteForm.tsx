"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { createInvite } from "@/app/[locale]/invites/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type InviteFormProps = {
  locale: string;
  labels: {
    email: string;
    role: string;
    roles: { contributor: string; viewer: string };
    submit: string;
    success: string;
    error: string;
  };
};

type ActionResult = Awaited<ReturnType<typeof createInvite>>;

function InviteForm({ locale, labels }: InviteFormProps): JSX.Element {
  const [state, formAction, pending] = useActionState(createInvite, {} as ActionResult);

  useEffect(() => {
    if (!state) return;
    if (state.error) {
      toast.error(state.error);
    } else if (state.success) {
      toast.success(labels.success);
    }
  }, [labels.success, state]);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-3">
      <input type="hidden" name="locale" value={locale} />
      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label htmlFor="email">{labels.email}</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="role">{labels.role}</Label>
        <select
          id="role"
          name="role"
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          defaultValue="CONTRIBUTOR"
        >
          <option value="CONTRIBUTOR">{labels.roles.contributor}</option>
          <option value="VIEWER">{labels.roles.viewer}</option>
        </select>
      </div>
      <div className="sm:col-span-3 flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? labels.submit : labels.submit}
        </Button>
      </div>
    </form>
  );
}

export { InviteForm };


