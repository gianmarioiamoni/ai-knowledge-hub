"use server";

import { headers } from "next/headers";
import { redirect } from "@/i18n/navigation";
import { getPriceId, stripe, type BillingCycle, type PaidPlanId, type PlanId } from "@/lib/server/stripe";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import type { PlanMetadata } from "@/lib/server/subscriptions";
import { setPlan } from "../profile/actions";

type StartCheckoutInput = {
  planId: PlanId;
  billingCycle: BillingCycle;
  locale: string;
};

const resolveOrigin = (): string => {
  const headerStore = headers();
  return (
    headerStore.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    "http://localhost:3000"
  );
};

const ensureCustomer = async (supabaseUserId: string, email: string | null, existingPlan?: PlanMetadata) => {
  if (existingPlan?.customerId) {
    return existingPlan.customerId;
  }

  const customer = await stripe.customers.create({
    email: email ?? undefined,
    metadata: {
      supabaseUserId,
    },
  });
  return customer.id;
};

const startPlanCheckout = async ({ planId, billingCycle, locale }: StartCheckoutInput): Promise<void> => {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  const user = data.user;

  if (error || !user) {
    redirect({ href: "/login", locale });
  }

  if (planId === "trial") {
    const formData = new FormData();
    formData.append("planId", "trial");
    formData.append("billingCycle", billingCycle);
    await setPlan({}, formData);
    redirect({ href: "/plans?checkout=trial", locale });
  }

  const paidPlanId = planId as PaidPlanId;
  const priceId = getPriceId(paidPlanId, billingCycle);
  const userMeta = (user.user_metadata as { plan?: PlanMetadata; stripeCustomerId?: string } | null) ?? {};
  const planMeta = userMeta.plan;
  const existingCustomerId = userMeta.stripeCustomerId ?? planMeta?.customerId ?? null;

  const customerId =
    existingCustomerId ??
    (await ensureCustomer(user.id, user.email ?? null, planMeta).catch(() => {
      throw new Error("stripe_customer_failed");
    }));

  if (!existingCustomerId) {
    await supabase.auth.updateUser({
      data: {
        ...userMeta,
        stripeCustomerId: customerId,
      },
    });
  }

  const origin = resolveOrigin();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${origin}/${locale}/plans?checkout=success`,
    cancel_url: `${origin}/${locale}/plans?checkout=cancel`,
    client_reference_id: user.id,
    allow_promotion_codes: true,
    metadata: {
      supabaseUserId: user.id,
      planId: paidPlanId,
      billingCycle,
    },
    subscription_data: {
      metadata: {
        supabaseUserId: user.id,
        planId: paidPlanId,
        billingCycle,
      },
    },
  });

  if (!session.url) {
    throw new Error("stripe_session_missing_url");
  }

  redirect(session.url);
};

export { startPlanCheckout };


