"use client";

import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import type { Plan, PlansSectionLabels } from "../types";

type PlanActionsProps = {
  plan: Plan;
  labels: PlansSectionLabels;
  isSelected: boolean;
  message: string | null;
  onSelect: () => void;
};

function PlanActions({ plan, labels, isSelected, message, onSelect }: PlanActionsProps): JSX.Element {
  return (
    <div className="mt-auto pt-2">
      <Button
        className="w-full"
        variant={plan.highlight ? "default" : "secondary"}
        onClick={onSelect}
      >
        {labels.select}
      </Button>
      {message && isSelected ? (
        <p className="mt-1 text-xs text-muted-foreground">
          {message === "ok" ? labels.selected : "Error"}
        </p>
      ) : null}
    </div>
  );
}

export { PlanActions };

