"use client";

import type { JSX } from "react";
import { Card } from "@/components/ui/card";
import type { Plan, PlansSectionLabels } from "./types";
import { PlanPricing } from "./PlanCard/PlanPricing";
import { PlanHeader } from "./PlanCard/PlanHeader";
import { PlanLimits } from "./PlanCard/PlanLimits";
import { PlanActions } from "./PlanCard/PlanActions";

type PlanCardProps = {
  plan: Plan;
  labels: PlansSectionLabels;
  isSelected: boolean;
  message: string | null;
  onSelect: () => void;
};

function PlanCard({ plan, labels, isSelected, message, onSelect }: PlanCardProps): JSX.Element {
  return (
    <Card
      className={`flex flex-col gap-4 border border-white/50 bg-white/80 p-5 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow ${
        plan.highlight ? "ring-2 ring-primary/60" : ""
      }`}
    >
      <PlanHeader plan={plan} labels={labels} isSelected={isSelected} />

      <PlanPricing monthly={plan.monthly} annual={plan.annual} monthlyLabel={labels.monthly} annualLabel={labels.annual} />

      <PlanLimits limits={plan.limits} />

      <PlanActions plan={plan} labels={labels} isSelected={isSelected} message={message} onSelect={onSelect} />
    </Card>
  );
}

export { PlanCard };

