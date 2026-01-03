"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { toast } from "sonner";
import { createInvite } from "@/app/[locale]/admin/actions";
import type { AdminLabels } from "./types";

export function useInviteForm({ locale, labels }: { locale: string; labels: AdminLabels }) {
  const router = useRouter();
  const [inviteState, inviteAction, invitePending] = useActionState(createInvite, {} as any);

  useEffect(() => {
    if (!inviteState) return;
    if (inviteState.error) {
      toast.error(inviteState.error);
    } else if (inviteState.success) {
      toast.success(labels.inviteFormSuccess);
      router.refresh();
    }
  }, [inviteState, labels.inviteFormSuccess, router]);

  return {
    inviteAction,
    invitePending,
  };
}

