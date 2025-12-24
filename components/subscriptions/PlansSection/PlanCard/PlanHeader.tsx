"use client";

import type { JSX } from "react";
import type { Plan, PlansSectionLabels } from "../types";

type PlanHeaderProps = {
  plan: Plan;
  labels: PlansSectionLabels;
  isSelected: boolean;
};

function PlanHeader({ plan, labels, isSelected }: PlanHeaderProps): JSX.Element {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">{plan.name}</p>
        <p className="text-sm text-muted-foreground">{plan.description}</p>
      </div>
      {isSelected ? (
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {labels.selected}
        </span>
      ) : null}
    </div>
  );
}

export { PlanHeader };

