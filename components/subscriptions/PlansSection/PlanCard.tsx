"use client";

import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Plan, PlansSectionLabels } from "./types";

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

      <div className="flex items-baseline gap-3">
        <div className="flex flex-col">
          <p className="text-2xl font-semibold text-foreground">{plan.monthly}</p>
          <p className="text-xs text-muted-foreground">{labels.monthly}</p>
        </div>
        <div className="flex flex-col">
          <p className="text-2xl font-semibold text-foreground">{plan.annual}</p>
          <p className="text-xs text-muted-foreground">{labels.annual}</p>
        </div>
      </div>

      <ul className="space-y-1 text-sm text-muted-foreground">
        {plan.limits.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-[3px] inline-block h-2 w-2 rounded-full bg-primary/70" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

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
    </Card>
  );
}

export { PlanCard };

