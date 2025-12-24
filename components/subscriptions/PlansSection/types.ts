type Plan = {
  id: "trial" | "smb" | "enterprise";
  name: string;
  description: string;
  monthly: string;
  annual: string;
  limits: string[];
  highlight?: boolean;
  hasBillingCycle?: boolean;
};

type PlansSectionLabels = {
  monthly: string;
  annual: string;
  select: string;
  selected: string;
};

type PlansSectionProps = {
  plans: Plan[];
  labels: PlansSectionLabels;
  currentPlan?: {
    planId: Plan["id"];
    billingCycle?: "monthly" | "annual";
  };
  onSelect?: (planId: Plan["id"], billingCycle: "monthly" | "annual") => Promise<void>;
};

type PlanSelectionState = {
  billingCycle: Record<Plan["id"], "monthly" | "annual">;
};

export type { Plan, PlansSectionLabels, PlansSectionProps, PlanSelectionState };

