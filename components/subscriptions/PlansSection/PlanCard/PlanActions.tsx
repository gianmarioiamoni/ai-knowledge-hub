"use client";

import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import type { Plan, PlansSectionLabels } from "../types";

type PlanActionsProps = {
  plan: Plan;
  labels: PlansSectionLabels;
  isSelected: boolean;
  message: string | null;
  billingCycle: Record<Plan["id"], "monthly" | "annual">;
  onSelect: (cycle?: "monthly" | "annual") => void;
  onCycleChange: (cycle: "monthly" | "annual") => void;
};

function PlanActions({
  plan,
  labels,
  isSelected,
  message,
  billingCycle,
  onSelect,
  onCycleChange,
}: PlanActionsProps): JSX.Element {
  const hasToggle = plan.id !== "trial" && (plan.hasBillingCycle ?? true);
  const currentCycle = billingCycle[plan.id] ?? "monthly";
  return (
    <div className="mt-auto pt-2">
      {hasToggle ? (
        <div className="mb-2 flex gap-2">
          <Button
            type="button"
            variant={currentCycle === "monthly" ? "default" : "outline"}
            size="sm"
            onClick={() => onCycleChange("monthly")}
            disabled={isSelected}
          >
            {labels.monthly}
          </Button>
          <Button
            type="button"
            variant={currentCycle === "annual" ? "default" : "outline"}
            size="sm"
            onClick={() => onCycleChange("annual")}
            disabled={isSelected}
          >
            {labels.annual}
          </Button>
        </div>
      ) : null}
      <Button
        className="w-full"
        variant={plan.highlight ? "default" : "secondary"}
        onClick={() => onSelect(currentCycle)}
        disabled={isSelected}
      >
        {labels.select}
      </Button>
    </div>
  );
}

export { PlanActions };

