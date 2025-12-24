"use client";

import type { JSX } from "react";
import { PlanCard } from "./PlansSection/PlanCard";
import type { Plan, PlansSectionProps } from "./PlansSection/types";
import { usePlanSelection } from "./PlansSection/usePlanSelection";

function PlansSection({ plans, labels, onSelect }: PlansSectionProps): JSX.Element {
  const { selected, message, handleSelect } = usePlanSelection({ onSelect });

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
            onSelect={() => handleSelect(plan.id)}
          />
        );
      })}
    </div>
  );
}

export { PlansSection };

