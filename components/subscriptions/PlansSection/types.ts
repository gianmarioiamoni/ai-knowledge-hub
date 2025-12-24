type Plan = {
  id: "trial" | "smb" | "enterprise";
  name: string;
  description: string;
  monthly: string;
  annual: string;
  limits: string[];
  highlight?: boolean;
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
  onSelect?: (planId: Plan["id"]) => Promise<void>;
};

export type { Plan, PlansSectionLabels, PlansSectionProps };

