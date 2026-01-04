// components/admin/DemoDataControl/DemoDataControl.tsx
"use client";

import type { JSX } from "react";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoDataStatusDisplay } from "./DemoDataStatus";
import { DemoDataActions } from "./DemoDataActions";
import { useDemoDataControl } from "./useDemoDataControl";
import type { DemoDataControlLabels } from "./types";

type DemoDataControlProps = {
  locale: string;
  labels: DemoDataControlLabels;
};

export function DemoDataControl({ locale, labels }: DemoDataControlProps): JSX.Element {
  const { status, isPending, refreshStatus, handleSeed, handleReset } = useDemoDataControl(locale, labels);

  // Load status on mount
  useEffect(() => {
    refreshStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{labels.title}</CardTitle>
        <CardDescription>{labels.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <DemoDataStatusDisplay status={status} labels={labels} />
          <DemoDataActions
            hasData={status.hasData}
            isPending={isPending}
            labels={labels}
            onSeed={handleSeed}
            onReset={handleReset}
          />
        </div>
      </CardContent>
    </Card>
  );
}

