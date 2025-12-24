"use client";

import type { JSX } from "react";

type PlanLimitsProps = {
  limits: string[];
};

function PlanLimits({ limits }: PlanLimitsProps): JSX.Element {
  return (
    <ul className="space-y-1 text-sm text-muted-foreground">
      {limits.map((item) => (
        <li key={item} className="flex items-start gap-2">
          <span className="mt-[3px] inline-block h-2 w-2 rounded-full bg-primary/70" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export { PlanLimits };

