"use client";

import type { JSX } from "react";
import { Card } from "@/components/ui/card";
import type { Plan } from "@/components/subscriptions/PlansSection/types";

type PricingCardsProps = {
  plans: Plan[];
  monthlyLabel: string;
  annualLabel: string;
  noteTrial: string;
  notePaid: string;
};

export function PricingCards({
  plans,
  monthlyLabel,
  annualLabel,
  noteTrial,
  notePaid,
}: PricingCardsProps): JSX.Element {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {plans.map((plan) => (
        <Card
          key={plan.id}
          className={`flex h-full flex-col gap-4 border border-white/50 bg-white/80 p-5 shadow-sm backdrop-blur transition ${
            plan.highlight ? "ring-2 ring-primary/60" : ""
          }`}
        >
          {/* Plan Header */}
          <div className="flex flex-col gap-1 min-h-[120px]">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">{plan.name}</p>
            <p className="text-sm text-muted-foreground">{plan.description}</p>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3">
            <div className="flex flex-col">
              <p className="text-2xl font-semibold text-foreground">{plan.monthly}</p>
              <p className="text-xs text-muted-foreground">{monthlyLabel}</p>
            </div>
            <div className="flex flex-col">
              <p className="text-2xl font-semibold text-foreground">{plan.annual}</p>
              <p className="text-xs text-muted-foreground">{annualLabel}</p>
            </div>
          </div>

          {/* Features List */}
          <ul className="space-y-1 text-sm text-muted-foreground">
            {plan.limits.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-[3px] inline-block h-2 w-2 rounded-full bg-primary/70" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {/* Note */}
          <div className="mt-auto pt-2">
            <div className="text-sm text-muted-foreground">
              {plan.id === "trial" ? noteTrial : notePaid}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}


