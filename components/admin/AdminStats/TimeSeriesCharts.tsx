import type { JSX } from "react";
import { Card } from "@/components/ui/card";
import { BarChart } from "./BarChart";

type TimeSeriesChartsProps = {
  conversationsTitle: string;
  proceduresTitle: string;
  conversations7d: Array<{ label: string; count: number }>;
  procedures7d: Array<{ label: string; count: number }>;
};

export function TimeSeriesCharts({
  conversationsTitle,
  proceduresTitle,
  conversations7d,
  procedures7d,
}: TimeSeriesChartsProps): JSX.Element {
  return (
    <Card className="border border-white/40 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-white/5">
      <h2 className="text-base font-semibold text-foreground">{conversationsTitle}</h2>
      <BarChart data={conversations7d} />
      <div className="mt-3">
        <h3 className="text-base font-semibold text-foreground">{proceduresTitle}</h3>
        <BarChart data={procedures7d} tone="secondary" />
      </div>
    </Card>
  );
}

