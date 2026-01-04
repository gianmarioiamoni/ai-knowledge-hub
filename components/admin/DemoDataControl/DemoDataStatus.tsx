// components/admin/DemoDataControl/DemoDataStatus.tsx
import type { JSX } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import type { DemoDataStatus, DemoDataControlLabels } from "./types";

type DemoDataStatusProps = {
  status: DemoDataStatus;
  labels: DemoDataControlLabels;
};

export function DemoDataStatusDisplay({ status, labels }: DemoDataStatusProps): JSX.Element {
  return (
    <Alert>
      <Info className="size-4" />
      <AlertDescription>
        <div className="space-y-1">
          <p className="font-semibold">
            {status.hasData ? labels.statusActive : labels.statusNotSeeded}
          </p>
          {status.hasData && (
            <div className="text-sm text-muted-foreground">
              {labels.documents}: {status.documentCount} ({status.chunkCount} {labels.chunks}) •{" "}
              {labels.conversations}: {status.conversationCount} ({status.messageCount} {labels.messages}) •{" "}
              {labels.procedures}: {status.procedureCount}
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

