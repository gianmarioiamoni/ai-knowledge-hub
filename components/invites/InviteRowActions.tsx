"use client";

import type { JSX } from "react";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { revokeInvite } from "@/app/[locale]/invites/actions";

type InviteRowActionsProps = {
  locale: string;
  id: string;
  labels: {
    revoke: string;
    revokeTitle: string;
    revokeDesc: string;
    cancel: string;
    success: string;
  };
};

function InviteRowActions({ locale, id, labels }: InviteRowActionsProps): JSX.Element {
  const [isPending, startTransition] = useTransition();

  return (
    <ConfirmDialog
      title={labels.revokeTitle}
      description={labels.revokeDesc}
      confirmLabel={labels.revoke}
      cancelLabel={labels.cancel}
      onConfirm={() =>
        startTransition(async () => {
          const fd = new FormData();
          fd.append("locale", locale);
          fd.append("id", id);
          const res = await revokeInvite({}, fd);
          if (res?.error) {
            toast.error(res.error);
          } else {
            toast.success(labels.success);
          }
        })
      }
      trigger={
        <Button variant="ghost" size="sm" className="text-rose-600 hover:text-rose-700" disabled={isPending}>
          {labels.revoke}
        </Button>
      }
    />
  );
}

export { InviteRowActions };


