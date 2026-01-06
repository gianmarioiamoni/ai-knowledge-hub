// components/admin/AdminStats/PlanDistribution.tsx
import type { JSX } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PlanDistribution as PlanDistributionType } from "./types";

type PlanDistributionProps = {
  title: string;
  distribution: PlanDistributionType;
  labels: {
    trial: string;
    demo: string;
    smb: string;
    enterprise: string;
    expired: string;
    none: string;
  };
  noDataLabel: string;
};

export function PlanDistribution({
  title,
  distribution,
  labels,
  noDataLabel,
}: PlanDistributionProps): JSX.Element {
  const total = Object.values(distribution).reduce((sum, val) => sum + val, 0);

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">{noDataLabel}</p>
        </CardContent>
      </Card>
    );
  }

  const data = [
    { label: labels.trial, value: distribution.trial, color: "bg-blue-500" },
    { label: labels.demo, value: distribution.demo, color: "bg-purple-500" },
    { label: labels.smb, value: distribution.smb, color: "bg-green-500" },
    { label: labels.enterprise, value: distribution.enterprise, color: "bg-orange-500" },
    { label: labels.expired, value: distribution.expired, color: "bg-red-500" },
    { label: labels.none, value: distribution.none, color: "bg-gray-500" },
  ].filter((item) => item.value > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item) => {
            const percentage = Math.round((item.value / total) * 100);
            return (
              <div key={item.label} className="flex items-center gap-3">
                <div className={`size-3 shrink-0 rounded-full ${item.color}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-muted-foreground">
                      {item.value} ({percentage}%)
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                    <div className={`h-full ${item.color}`} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

