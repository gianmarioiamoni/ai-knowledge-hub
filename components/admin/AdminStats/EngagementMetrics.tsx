// components/admin/AdminStats/EngagementMetrics.tsx
import type { JSX } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EngagementMetrics as EngagementMetricsType } from "./types";

type EngagementMetricsProps = {
  title: string;
  metrics: EngagementMetricsType;
  labels: {
    avgDocsPerOrg: string;
    avgChatsPerOrg: string;
    avgSopsPerOrg: string;
    avgMembersPerOrg: string;
    activeUsers7d: string;
    activeUsers30d: string;
  };
};

export function EngagementMetrics({ title, metrics, labels }: EngagementMetricsProps): JSX.Element {
  const items = [
    { label: labels.avgDocsPerOrg, value: metrics.avgDocsPerOrg.toFixed(1), icon: "📄" },
    { label: labels.avgChatsPerOrg, value: metrics.avgChatsPerOrg.toFixed(1), icon: "💬" },
    { label: labels.avgSopsPerOrg, value: metrics.avgSopsPerOrg.toFixed(1), icon: "📋" },
    { label: labels.avgMembersPerOrg, value: metrics.avgMembersPerOrg.toFixed(1), icon: "👥" },
    { label: labels.activeUsers7d, value: metrics.activeUsers7d.toString(), icon: "🔥", highlight: true },
    { label: labels.activeUsers30d, value: metrics.activeUsers30d.toString(), icon: "📊", highlight: true },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.label}
              className={`rounded-lg border p-4 ${item.highlight ? "border-primary bg-primary/5" : "border-border"}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-2xl font-semibold">{item.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

