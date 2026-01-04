// components/admin/DemoDataControl/DemoDataActions.tsx
import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import type { DemoDataControlLabels } from "./types";

type DemoDataActionsProps = {
  hasData: boolean;
  isPending: boolean;
  labels: DemoDataControlLabels;
  onSeed: () => void;
  onReset: () => void;
};

export function DemoDataActions({
  hasData,
  isPending,
  labels,
  onSeed,
  onReset,
}: DemoDataActionsProps): JSX.Element {
  return (
    <div className="flex gap-2">
      <Button onClick={onSeed} disabled={hasData || isPending}>
        {isPending ? labels.seeding : labels.seedButton}
      </Button>

      <ConfirmDialog
        title={labels.resetTitle}
        description={labels.resetDescription}
        confirmLabel={labels.resetConfirm}
        cancelLabel={labels.cancel}
        onConfirm={onReset}
        trigger={
          <Button variant="destructive" disabled={!hasData || isPending}>
            {isPending ? labels.resetting : labels.resetButton}
          </Button>
        }
      />
    </div>
  );
}

