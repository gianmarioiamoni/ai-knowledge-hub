import type { JSX } from "react";
import { StatusCard } from "./StatusCard";
import type { DashboardStat } from "./types";

type StatsGridProps = {
  stats: DashboardStat[];
};

export function StatsGrid({ stats }: StatsGridProps): JSX.Element {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => (
        <StatusCard key={item.label} title={item.label}>
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-semibold text-foreground">{item.value}</span>
            <span className="text-sm text-muted-foreground">{item.delta}</span>
          </div>
        </StatusCard>
      ))}
    </div>
  );
}

