"use client";

import type { JSX } from "react";
import { PlanCard } from "./PlansSection/PlanCard";
import type { Plan, PlansSectionProps } from "./PlansSection/types";
import { usePlanSelection } from "./PlansSection/usePlanSelection";
import type { PlanSelectionState } from "./PlansSection/types";

function PlansSection({ plans, labels, currentPlan, onSelect }: PlansSectionProps): JSX.Element {
  const { selected, message, billingCycle, setBillingCycle, handleSelect } = usePlanSelection({
    currentPlan,
    onSelect,
  });
  const selectionState: PlanSelectionState = { billingCycle };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {plans.map((plan) => {
        const isSelected = selected === plan.id;
        return (
          <PlanCard
            key={plan.id}
            plan={plan}
            labels={labels}
            isSelected={isSelected}
            message={message}
            selectionState={selectionState}
            onSelect={(cycle) => handleSelect(plan.id, cycle)}
            onCycleChange={(cycle) => setBillingCycle(plan.id, cycle)}
          />
        );
      })}
    </div>
  );
}

export { PlansSection };

