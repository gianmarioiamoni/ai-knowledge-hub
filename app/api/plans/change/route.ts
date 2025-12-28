import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import type { PlanMetadata } from "@/lib/server/subscriptions";

const bodySchema = z.object({
  planId: z.enum(["trial", "smb", "enterprise", "cancel"]),
  billingCycle: z.enum(["monthly", "annual"]).default("monthly"),
});

const addDays = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

const computeRenewalAt = (billing: "monthly" | "annual"): string => {
  return addDays(billing === "monthly" ? 30 : 365);
};

const buildPlanMeta = (
  planId: string,
  billing: "monthly" | "annual",
  current?: PlanMetadata,
): PlanMetadata => {
  if (planId === "trial") {
    return {
      id: "trial",
      trialEndsAt: current?.trialEndsAt ?? addDays(30),
      billingCycle: billing,
      renewalAt: current?.trialEndsAt ?? addDays(30),
      reminder3DaysSent: false,
      reminder1DaySent: false,
    };
  }
  if (planId === "cancel") {
    const expires = current?.trialEndsAt ? new Date(current.trialEndsAt).getTime() : 0;
    const hasTrialLeft = expires > Date.now();
    return hasTrialLeft
      ? {
          id: "trial",
          trialEndsAt: current?.trialEndsAt,
          billingCycle: billing,
          renewalAt: current?.trialEndsAt,
          reminder3DaysSent: false,
          reminder1DaySent: false,
        }
      : {
          id: "expired",
          billingCycle: billing,
          renewalAt: null,
          reminder3DaysSent: false,
          reminder1DaySent: false,
        };
  }
  return {
    id: planId,
    trialEndsAt: undefined,
    billingCycle: billing,
    renewalAt: computeRenewalAt(billing),
    reminder3DaysSent: false,
    reminder1DaySent: false,
  };
};

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  const { data, error: userErr } = await supabase.auth.getUser();
  if (userErr || !data.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const currentPlan = (data.user.user_metadata as { plan?: PlanMetadata } | null)?.plan;
  const planMeta = buildPlanMeta(parsed.data.planId, parsed.data.billingCycle, currentPlan);

  const { error } = await supabase.auth.updateUser({
    data: { plan: { ...planMeta, updatedAt: new Date().toISOString() } },
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, plan: planMeta });
}

