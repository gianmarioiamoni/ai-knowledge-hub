import type { User } from "@supabase/supabase-js";
import { redirect } from "@/i18n/navigation";
import { createSupabaseServiceClient } from "./supabaseService";

type PlanMetadata = {
  id?: string;
  trialEndsAt?: string;
  billingCycle?: "monthly" | "annual";
  renewalAt?: string | null;
  subscriptionId?: string | null;
  customerId?: string | null;
  cancelAtPeriodEnd?: boolean;
  reminder3DaysSent?: boolean;
  reminder1DaySent?: boolean;
};

type PlanStatus = {
  planId: string | null;
  trialEndsAt?: string | null;
  billingCycle?: "monthly" | "annual";
  renewalAt?: string | null;
  subscriptionId?: string | null;
  expired: boolean;
};

type PlanLimits = {
  maxContributors: number;
  maxViewers: number;
  maxDocuments: number;
  maxProcedures: number;
  maxConversations: number;
};

const planLimits: Record<string, PlanLimits> = {
  trial: { 
    maxContributors: 5, 
    maxViewers: 20,
    maxDocuments: 10,
    maxProcedures: 5,
    maxConversations: 20,
  },
  smb: { 
    maxContributors: 20, 
    maxViewers: 100,
    maxDocuments: 100,
    maxProcedures: 50,
    maxConversations: 200,
  },
  enterprise: { 
    maxContributors: 200, 
    maxViewers: 1000,
    maxDocuments: 1000,
    maxProcedures: 500,
    maxConversations: 2000,
  },
  expired: { 
    maxContributors: 0, 
    maxViewers: 0,
    maxDocuments: 0,
    maxProcedures: 0,
    maxConversations: 0,
  },
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
  return role === "SUPER_ADMIN";
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

const getPlanLimits = (planId: string | null): PlanLimits => {
  if (!planId) return planLimits.trial;
  return planLimits[planId] ?? planLimits.trial;
};

const getOrganizationPlanId = async (organizationId: string): Promise<string> => {
  const service = createSupabaseServiceClient();
  const { data: adminMember } = await service
    .from("organization_members")
    .select("user_id, role")
    .eq("organization_id", organizationId)
    .eq("role", "COMPANY_ADMIN")
    .limit(1)
    .maybeSingle();

  const fallback = "trial";
  if (!adminMember?.user_id) return fallback;

  const { data: user } = await service.auth.admin.getUserById(adminMember.user_id);
  const planId = ((user?.user?.user_metadata as { plan?: PlanMetadata } | null)?.plan?.id as string | undefined) ?? fallback;
  return planId ?? fallback;
};

export type { PlanStatus, PlanMetadata, PlanLimits };
export { getPlanStatus, ensureActivePlan, isUnlimitedRole, getPlanLimits, getOrganizationPlanId };

