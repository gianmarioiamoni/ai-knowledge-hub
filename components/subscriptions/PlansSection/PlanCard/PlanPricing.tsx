import type { JSX } from "react";

type PlanPricingProps = {
  monthly: string;
  annual: string;
  monthlyLabel: string;
  annualLabel: string;
};

function PlanPricing({ monthly, annual, monthlyLabel, annualLabel }: PlanPricingProps): JSX.Element {
  return (
    <div className="flex items-baseline gap-3">
      <div className="flex flex-col">
        <p className="text-2xl font-semibold text-foreground">{monthly}</p>
        <p className="text-xs text-muted-foreground">{monthlyLabel}</p>
      </div>
      <div className="flex flex-col">
        <p className="text-2xl font-semibold text-foreground">{annual}</p>
        <p className="text-xs text-muted-foreground">{annualLabel}</p>
      </div>
    </div>
  );
}

export { PlanPricing };

