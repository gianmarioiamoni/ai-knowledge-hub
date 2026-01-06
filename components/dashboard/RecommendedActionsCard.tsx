"use client";

import type { JSX } from "react";
import { StatusCard } from "./StatusCard";

type RecommendedActionsCardProps = {
  title: string;
  description: string;
  actions: string[];
  kpiTitle: string;
  kpiDescription: string;
};

export function RecommendedActionsCard({
  title,
  description,
  actions,
  kpiTitle,
  kpiDescription,
}: RecommendedActionsCardProps): JSX.Element {
  return (
    <StatusCard title={title}>
      <p className="text-sm text-muted-foreground">{description}</p>
      <div className="space-y-3">
        {actions.map((action) => (
          <div
            key={action}
            className="flex items-start gap-3 rounded-2xl border border-white/40 bg-white/70 p-4 text-sm font-semibold text-foreground shadow-inner backdrop-blur dark:border-white/10 dark:bg-white/5"
          >
            <span className="mt-0.5 size-2 rounded-full bg-primary shadow-[0_0_0_6px_rgba(79,70,229,0.14)]" />
            {action}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3 rounded-2xl border border-white/40 bg-gradient-to-br from-primary/10 via-secondary/20 to-accent/10 p-4 text-sm text-foreground shadow-md backdrop-blur dark:border-white/10 dark:from-primary/20 dark:via-secondary/10 dark:to-accent/10">
        <div className="flex items-center gap-2 font-semibold">
          <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary">
            •
          </span>
          {kpiTitle}
        </div>
        <p className="text-sm text-muted-foreground">{kpiDescription}</p>
      </div>
    </StatusCard>
  );
}


