"use client";

import type { JSX } from "react";

type BarChartProps = {
  data: Array<{ label: string; count: number }>;
  tone?: "primary" | "secondary";
};

export function BarChart({ data, tone = "primary" }: BarChartProps): JSX.Element {
  const max = Math.max(...data.map((d) => d.count), 1);
  const barClass = tone === "primary" ? "bg-primary/80" : "bg-accent/70";

  return (
    <div className="mt-3 space-y-2">
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground">—</p>
      ) : (
        data.map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-12">{d.label}</span>
            <div className="h-2 flex-1 rounded-full bg-border">
              <div className={`h-2 rounded-full ${barClass}`} style={{ width: `${(d.count / max) * 100}%` }} />
            </div>
            <span className="w-8 text-right text-foreground">{d.count}</span>
          </div>
        ))
      )}
    </div>
  );
}

