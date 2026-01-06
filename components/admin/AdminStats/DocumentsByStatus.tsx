import type { JSX } from "react";
import { Card } from "@/components/ui/card";

type DocumentsByStatusProps = {
  title: string;
  documentsByStatus: Record<string, number>;
  noDataLabel: string;
};

export function DocumentsByStatus({ title, documentsByStatus, noDataLabel }: DocumentsByStatusProps): JSX.Element {
  return (
    <Card className="border border-white/40 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-white/5">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <div className="mt-3 space-y-2">
        {Object.keys(documentsByStatus).length === 0 ? (
          <p className="text-sm text-muted-foreground">{noDataLabel}</p>
        ) : (
          Object.entries(documentsByStatus).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between text-sm">
              <span className="capitalize text-muted-foreground">{status}</span>
              <span className="font-semibold text-foreground">{count}</span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

