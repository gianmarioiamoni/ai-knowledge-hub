"use client";

import type { JSX } from "react";
import { Card } from "@/components/ui/card";
import type { Plan, PlansSectionLabels } from "./types";
import { PlanPricing } from "./PlanCard/PlanPricing";
import { PlanHeader } from "./PlanCard/PlanHeader";
import { PlanLimits } from "./PlanCard/PlanLimits";
import { PlanActions } from "./PlanCard/PlanActions";
import type { PlanSelectionState } from "./types";

type PlanCardProps = {
  plan: Plan;
  labels: PlansSectionLabels;
  isSelected: boolean;
  message: string | null;
  selectionState: PlanSelectionState;
  onSelect: (cycle?: "monthly" | "annual") => void;
  onCycleChange: (cycle: "monthly" | "annual") => void;
};

function PlanCard({
  plan,
  labels,
  isSelected,
  message,
  selectionState,
  onSelect,
  onCycleChange,
}: PlanCardProps): JSX.Element {
  return (
    <Card
      className={`flex h-full flex-col gap-4 border border-white/50 bg-white/80 p-5 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow ${
        plan.highlight ? "ring-2 ring-primary/60" : ""
      }`}
    >
      <div className="flex flex-col gap-3 min-h-[140px]">
        <PlanHeader plan={plan} labels={labels} isSelected={isSelected} />
        <PlanPricing
          monthly={plan.monthly}
          annual={plan.annual}
          monthlyLabel={labels.monthly}
          annualLabel={labels.annual}
        />
      </div>

      <PlanLimits limits={plan.limits} />

      <PlanActions
        plan={plan}
        labels={labels}
        isSelected={isSelected}
        message={message}
        billingCycle={selectionState.billingCycle}
        onSelect={onSelect}
        onCycleChange={onCycleChange}
      />
    </Card>
  );
}

export { PlanCard };

