"use client";

import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import type { AdminLabels } from "./types";

type InviteFormProps = {
  locale: string;
  labels: AdminLabels;
  inviteAction: (formData: FormData) => void;
  invitePending: boolean;
};

export function InviteForm({ locale, labels, inviteAction, invitePending }: InviteFormProps): JSX.Element {
  return (
    <Card className="p-2 sm:p-3">
      <h2 className="mb-2 text-xs font-semibold text-foreground">{labels.inviteFormTitle}</h2>
      <form action={inviteAction} className="space-y-2">
        <input type="hidden" name="locale" value={locale} />
        <div className="space-y-1">
          <Label htmlFor="email" className="text-[10px]">
            {labels.inviteFormEmail}
          </Label>
          <Input id="email" name="email" type="email" required className="h-7 text-[11px]" />
        </div>
        <div className="flex gap-1.5">
          <div className="flex-1 space-y-1">
            <Label htmlFor="role" className="text-[10px]">
              {labels.inviteFormRole}
            </Label>
            <select
              id="role"
              name="role"
              className="h-7 w-full rounded-md border border-input bg-background px-2 text-[11px]"
              defaultValue="CONTRIBUTOR"
            >
              <option value="CONTRIBUTOR">{labels.inviteFormRoleContributor}</option>
              <option value="VIEWER">{labels.inviteFormRoleViewer}</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={invitePending} size="sm" className="h-7 px-2 text-[10px]">
              {labels.inviteFormSubmit}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}

