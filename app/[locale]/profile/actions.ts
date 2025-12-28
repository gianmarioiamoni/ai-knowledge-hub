"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import { createSupabaseServiceClient } from "@/lib/server/supabaseService";
import type { PlanMetadata } from "@/lib/server/subscriptions";
import { stripe } from "@/lib/server/stripe";
import { sendAdminAccountDeleted } from "@/lib/server/email";

type ActionResult = { error?: string; success?: string };

const passwordSchema = z
  .object({
    password: z.string().min(8, "Password troppo corta"),
    confirm: z.string().min(8, "Password troppo corta"),
  })
  .refine((val) => val.password === val.confirm, {
    message: "Le password non coincidono",
  });

export const changePassword = async (_prev: ActionResult, formData: FormData): Promise<ActionResult> => {
  const parsed = passwordSchema.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi" };
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { error: error.message };
  }
  return { success: "updated" };
};

export const deleteAccount = async (): Promise<ActionResult> => {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  const user = data.user;
  if (error || !user) {
    return { error: "Not authenticated" };
  }

  const service = createSupabaseServiceClient();
  const { error: delError } = await service.auth.admin.deleteUser(user.id);
  if (delError) {
    return { error: delError.message };
  }

  if (user.email) {
    await sendAdminAccountDeleted(user.email).catch(() => {});
  }

  await supabase.auth.signOut();
  redirect("/login");
};

const addDays = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

const computeRenewalAt = (billing: "monthly" | "annual"): string => {
  return addDays(billing === "monthly" ? 30 : 365);
};

const buildPlanMeta = (planId: string, billing: "monthly" | "annual", existing?: PlanMetadata): PlanMetadata => {
  if (planId === "trial") {
    return {
      id: "trial",
      trialEndsAt: existing?.trialEndsAt ?? addDays(30),
      billingCycle: billing,
      renewalAt: existing?.trialEndsAt ?? addDays(30),
      subscriptionId: null,
      customerId: existing?.customerId,
      cancelAtPeriodEnd: false,
      reminder3DaysSent: false,
      reminder1DaySent: false,
    };
  }
  if (planId === "cancel") {
    const expires = existing?.trialEndsAt ? new Date(existing.trialEndsAt).getTime() : 0;
    const hasTrialLeft = expires > Date.now();
    return hasTrialLeft
      ? {
          id: "trial",
          trialEndsAt: existing?.trialEndsAt,
          billingCycle: billing,
          renewalAt: existing?.trialEndsAt,
          subscriptionId: null,
          customerId: existing?.customerId,
          cancelAtPeriodEnd: false,
          reminder3DaysSent: false,
          reminder1DaySent: false,
        }
      : {
          id: "expired",
          billingCycle: billing,
          renewalAt: null,
          subscriptionId: null,
          customerId: existing?.customerId,
          cancelAtPeriodEnd: false,
          reminder3DaysSent: false,
          reminder1DaySent: false,
        };
  }
  return {
    id: planId,
    trialEndsAt: undefined,
    billingCycle: billing,
    renewalAt: computeRenewalAt(billing),
    subscriptionId: existing?.subscriptionId ?? null,
    customerId: existing?.customerId,
    cancelAtPeriodEnd: false,
    reminder3DaysSent: false,
    reminder1DaySent: false,
  };
};

export const setPlan = async (_prev: ActionResult, formData: FormData): Promise<ActionResult> => {
  const planId = (formData.get("planId") as string) ?? "trial";
  const billingCycle = ((formData.get("billingCycle") as string) ?? "monthly") as "monthly" | "annual";
  const supabase = createSupabaseServerClient();
  const { data, error: getErr } = await supabase.auth.getUser();
  if (getErr || !data.user) {
    return { error: "Not authenticated" };
  }

  const currentPlan = (data.user.user_metadata as { plan?: PlanMetadata } | null)?.plan;
  const planMeta = buildPlanMeta(planId, billingCycle, currentPlan);

  const { error } = await supabase.auth.updateUser({
    data: {
      plan: {
        ...planMeta,
        updatedAt: new Date().toISOString(),
      } satisfies PlanMetadata & { updatedAt: string },
    },
  });
  if (error) {
    return { error: error.message };
  }
  return { success: "updated" };
};

export const cancelStripeSubscription = async (): Promise<ActionResult> => {
  const supabase = createSupabaseServerClient();
  const { data, error: getErr } = await supabase.auth.getUser();
  const user = data.user;
  if (getErr || !user) {
    return { error: "Not authenticated" };
  }

  const planMeta = (user.user_metadata as { plan?: PlanMetadata } | null)?.plan;
  const subscriptionId = planMeta?.subscriptionId;
  const billingCycle = planMeta?.billingCycle ?? "monthly";

  if (subscriptionId) {
    try {
      await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
        metadata: {
          supabaseUserId: user.id,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Stripe cancellation failed";
      return { error: message };
    }
  }

  const { error } = await supabase.auth.updateUser({
    data: {
      ...((user.user_metadata as Record<string, unknown> | null) ?? {}),
      plan: {
        ...planMeta,
        cancelAtPeriodEnd: true,
        billingCycle,
      },
    },
  });
  if (error) {
    return { error: error.message };
  }

  return { success: "updated" };
};

