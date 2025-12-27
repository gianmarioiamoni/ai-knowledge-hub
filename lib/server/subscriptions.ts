import type { User } from "@supabase/supabase-js";
import { redirect } from "@/i18n/navigation";

type PlanMetadata = {
  id?: string;
  trialEndsAt?: string;
  billingCycle?: "monthly" | "annual";
  renewalAt?: string | null;
  subscriptionId?: string | null;
  customerId?: string | null;
  cancelAtPeriodEnd?: boolean;
};

type PlanStatus = {
  planId: string | null;
  trialEndsAt?: string | null;
  billingCycle?: "monthly" | "annual";
  renewalAt?: string | null;
  subscriptionId?: string | null;
  expired: boolean;
};

const getPlanStatus = (user: User): PlanStatus => {
  const meta = (user.user_metadata as { plan?: PlanMetadata } | null)?.plan ?? {};
  const planId = meta.id ?? "trial";
  const trialEndsAt = meta.trialEndsAt ?? null;
  const billingCycle = meta.billingCycle;
  const renewalAt = meta.renewalAt ?? null;
  const subscriptionId = meta.subscriptionId ?? null;
  let expired = false;
  if (planId === "trial" && trialEndsAt) {
    expired = new Date(trialEndsAt).getTime() < Date.now();
  }
  if (planId === null || planId === "expired") {
    expired = true;
  }
  return { planId, trialEndsAt, billingCycle, renewalAt, subscriptionId, expired };
};

const isUnlimitedRole = (user: User): boolean => {
  const role = (user.user_metadata as { role?: string } | null)?.role;
  return role === "SUPER_ADMIN" || role === "ORG_ADMIN";
};

const ensureActivePlan = (user: User, locale: string, skipRedirect = false): void => {
  if (isUnlimitedRole(user)) return;
  const status = getPlanStatus(user);
  if (status.planId === "smb" || status.planId === "enterprise") return;
  if (status.planId === "trial" && !status.expired) return;
  if (!skipRedirect) {
    redirect({ href: "/plans", locale });
  }
};

export type { PlanStatus, PlanMetadata };
export { getPlanStatus, ensureActivePlan, isUnlimitedRole };

