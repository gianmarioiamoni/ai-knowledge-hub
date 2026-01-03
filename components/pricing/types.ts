import type { Plan } from "@/components/subscriptions/PlansSection/types";

export type PricingPageLabels = {
  title: string;
  subtitle: string;
  description: string;
  noteTrial: string;
  notePaid: string;
  cta: {
    title: string;
    description: string;
    login: string;
    contact: string;
  };
  monthlyLabel: string;
  annualLabel: string;
};

export type PricingPlans = {
  trial: Plan;
  smb: Plan;
  enterprise: Plan;
};

