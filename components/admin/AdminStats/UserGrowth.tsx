// components/admin/AdminStats/UserGrowth.tsx
import type { JSX } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type UserGrowthProps = {
  title: string;
  data: Array<{ label: string; count: number }>;
  noDataLabel: string;
};

export function UserGrowth({ title, data, noDataLabel }: UserGrowthProps): JSX.Element {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const total = data.reduce((sum, d) => sum + d.count, 0);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <span className="text-sm font-normal text-muted-foreground">+{total} users</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          {/* Y-axis labels */}
          <div className="flex h-full gap-2">
            <div className="flex flex-col justify-between py-1 text-xs text-muted-foreground">
              <span>{maxCount}</span>
              <span>{Math.round(maxCount / 2)}</span>
              <span>0</span>
            </div>

            {/* Chart bars */}
            <div className="flex flex-1 items-end gap-1">
              {data.map((item, index) => {
                const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                const isFirst = index === 0;
                const isLast = index === data.length - 1;
                const showLabel = isFirst || isLast || index % 5 === 0;

                return (
                  <div key={item.label} className="group relative flex flex-1 flex-col items-center">
                    {/* Tooltip on hover */}
                    <div className="pointer-events-none absolute -top-10 hidden rounded bg-foreground px-2 py-1 text-xs text-background group-hover:block">
                      {item.count}
                    </div>

                    {/* Bar */}
                    <div className="relative w-full" style={{ height: "100%" }}>
                      <div
                        className="absolute bottom-0 w-full rounded-t bg-primary transition-all group-hover:opacity-80"
                        style={{ height: `${height}%` }}
                      />
                    </div>

                    {/* X-axis label */}
                    {showLabel && (
                      <span className="mt-2 text-[10px] text-muted-foreground">{item.label}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

