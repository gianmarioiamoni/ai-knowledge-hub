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
        <div className="space-y-2">
          {/* Chart area */}
          <div className="flex gap-2">
            {/* Y-axis labels */}
            <div className="flex w-8 flex-col justify-between text-right text-xs text-muted-foreground">
              <span>{maxCount}</span>
              <span className="mt-20">{Math.round(maxCount / 2)}</span>
              <span className="mt-20">0</span>
            </div>

            {/* Bars container with fixed height */}
            <div className="relative flex flex-1 items-end gap-1" style={{ height: "200px" }}>
              {data.map((item, index) => {
                const heightPx = maxCount > 0 ? (item.count / maxCount) * 200 : 0;
                const isFirst = index === 0;
                const isLast = index === data.length - 1;
                const showLabel = isFirst || isLast || index % 5 === 0;

                return (
                  <div
                    key={item.label}
                    className="group relative flex flex-1 flex-col items-center"
                    style={{ height: `${heightPx}px` }}
                  >
                    {/* Tooltip on hover */}
                    {item.count > 0 && (
                      <div className="pointer-events-none absolute -top-8 hidden rounded bg-foreground px-2 py-1 text-xs text-background group-hover:block">
                        {item.count}
                      </div>
                    )}

                    {/* Bar */}
                    <div
                      className="w-full rounded-t bg-primary transition-all group-hover:opacity-80"
                      style={{ height: `${heightPx}px`, minHeight: item.count > 0 ? "2px" : "0px" }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* X-axis labels */}
          <div className="flex gap-2">
            <div className="w-8" /> {/* Spacer for Y-axis */}
            <div className="flex flex-1 justify-between text-[10px] text-muted-foreground">
              {data.map((item, index) => {
                const isFirst = index === 0;
                const isLast = index === data.length - 1;
                const showLabel = isFirst || isLast || index % 5 === 0;

                return showLabel ? <span key={item.label}>{item.label}</span> : <span key={item.label} />;
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

