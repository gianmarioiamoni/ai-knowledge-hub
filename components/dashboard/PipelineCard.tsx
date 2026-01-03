"use client";

import type { JSX } from "react";
import { StatusCard } from "./StatusCard";
import type { PipelineStep } from "./types";

type PipelineCardProps = {
  title: string;
  description: string;
  steps: PipelineStep[];
};

export function PipelineCard({ title, description, steps }: PipelineCardProps): JSX.Element {
  return (
    <StatusCard title={title}>
      <p className="text-sm text-muted-foreground">{description}</p>
      <div className="space-y-4">
        {steps.map((item, idx) => (
          <div
            key={item.title}
            className="flex items-start gap-4 rounded-2xl border border-white/40 bg-white/70 p-4 shadow-inner backdrop-blur dark:border-white/10 dark:bg-white/5"
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary ring-1 ring-primary/20">
              {idx + 1}
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-foreground">{item.title}</p>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </StatusCard>
  );
}

