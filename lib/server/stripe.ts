import Stripe from "stripe";
import { env } from "@/lib/env";

type PaidPlanId = "smb" | "enterprise";
type PlanId = "trial" | PaidPlanId;
type BillingCycle = "monthly" | "annual";

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

const priceMap: Record<PaidPlanId, Record<BillingCycle, string>> = {
  smb: {
    monthly: env.STRIPE_PRICE_SMB_MONTHLY,
    annual: env.STRIPE_PRICE_SMB_ANNUAL,
  },
  enterprise: {
    monthly: env.STRIPE_PRICE_ENTERPRISE_MONTHLY,
    annual: env.STRIPE_PRICE_ENTERPRISE_ANNUAL,
  },
};

const getPriceId = (planId: PaidPlanId, billingCycle: BillingCycle): string => priceMap[planId][billingCycle];

const resolvePlanFromPriceId = (
  priceId: string,
): { planId: PaidPlanId; billingCycle: BillingCycle } | null => {
  const entry = Object.entries(priceMap).find(([, cycles]) =>
    Object.values(cycles).includes(priceId),
  );
  if (!entry) return null;
  const [planId, cycles] = entry as [PaidPlanId, Record<BillingCycle, string>];
  const billingCycle = (Object.entries(cycles).find(([, pid]) => pid === priceId)?.[0] ??
    "monthly") as BillingCycle;
  return { planId, billingCycle };
};

export type { PaidPlanId, PlanId, BillingCycle };
export { stripe, getPriceId, resolvePlanFromPriceId };


