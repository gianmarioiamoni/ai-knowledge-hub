import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { resolvePlanFromPriceId, stripe } from "@/lib/server/stripe";
import type { PlanMetadata } from "@/lib/server/subscriptions";
import { createSupabaseServiceClient } from "@/lib/server/supabaseService";
import { env } from "@/lib/env";
import { sendAdminSubscriptionChange } from "@/lib/server/email";

type PlanPatch = PlanMetadata & { id: string };

const upsertUserPlan = async (
  supabaseUserId: string,
  planPatch: PlanPatch,
  stripeCustomerId?: string | null,
): Promise<{ email: string | null }> => {
  const supabase = createSupabaseServiceClient();
  const { data } = await supabase.auth.admin.getUserById(supabaseUserId);
  const existingMeta = (data.user?.user_metadata as Record<string, unknown> | null) ?? {};
  const existingPlan = (existingMeta.plan as PlanMetadata | undefined) ?? {};
  const nextPlan: PlanMetadata = { ...existingPlan, ...planPatch, reminder3DaysSent: false, reminder1DaySent: false };

  const nextMetadata: Record<string, unknown> = {
    ...existingMeta,
    plan: nextPlan,
  };
  if (stripeCustomerId) {
    nextMetadata.stripeCustomerId = stripeCustomerId;
  }

  await supabase.auth.admin.updateUserById(supabaseUserId, {
    user_metadata: nextMetadata,
  });
  return { email: data.user?.email ?? null };
};

const buildPlanFromSubscription = (subscription: Stripe.Subscription): PlanPatch | null => {
  const priceId = subscription.items.data[0]?.price?.id;
  if (!priceId) return null;
  const planInfo = resolvePlanFromPriceId(priceId);
  if (!planInfo) return null;
  const subAny = subscription as unknown as Record<string, unknown>;
  const renewalEpoch = typeof subAny.current_period_end === "number" ? subAny.current_period_end : null;
  const renewalAt = renewalEpoch ? new Date(renewalEpoch * 1000).toISOString() : null;
  const trialEpoch = typeof subAny.trial_end === "number" ? subAny.trial_end : null;
  const trialEndsAt = trialEpoch ? new Date(trialEpoch * 1000).toISOString() : undefined;

  return {
    id: planInfo.planId,
    billingCycle: planInfo.billingCycle,
    renewalAt,
    trialEndsAt,
    subscriptionId: subscription.id,
    customerId: typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id,
    cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
  };
};

export async function POST(request: Request): Promise<NextResponse> {
  const headerStore = await headers();
  const signature = headerStore.get("stripe-signature");
  const body = await request.text();

  if (!signature) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : "invalid_signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const supabaseUserId = session.metadata?.supabaseUserId;
        const subscriptionId = session.subscription as string | null;
        const customerId = session.customer as string | null;
        if (!supabaseUserId || !subscriptionId || !customerId) break;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const plan = buildPlanFromSubscription(subscription);
        if (plan) {
          const { email } = await upsertUserPlan(supabaseUserId, plan, customerId);
          await sendAdminSubscriptionChange({
            userEmail: email,
            planId: plan.id,
            billingCycle: plan.billingCycle,
          }).catch(() => {});
        }
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const supabaseUserId = subscription.metadata?.supabaseUserId;
        if (!supabaseUserId) break;
        const plan = buildPlanFromSubscription(subscription);
        if (plan) {
          const { email } = await upsertUserPlan(supabaseUserId, plan);
          await sendAdminSubscriptionChange({
            userEmail: email,
            planId: plan.id,
            billingCycle: plan.billingCycle,
          }).catch(() => {});
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const supabaseUserId = subscription.metadata?.supabaseUserId;
        if (!supabaseUserId) break;
        const { email } = await upsertUserPlan(supabaseUserId, {
          id: "expired",
          billingCycle: subscription.metadata?.billingCycle as PlanPatch["billingCycle"],
          renewalAt: null,
          trialEndsAt: undefined,
          subscriptionId: null,
          customerId: typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id,
          cancelAtPeriodEnd: false,
        });
        await sendAdminSubscriptionChange({
          userEmail: email,
          planId: "expired",
          billingCycle: subscription.metadata?.billingCycle as PlanPatch["billingCycle"],
        }).catch(() => {});
        break;
      }
      default:
        break;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "webhook_error";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}


