import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import type { PlanMetadata } from "@/lib/server/subscriptions";

const bodySchema = z.object({
  planId: z.enum(["trial", "smb", "enterprise", "cancel"]),
});

const addDays = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

const buildPlanMeta = (planId: string, current?: PlanMetadata): PlanMetadata => {
  if (planId === "trial") {
    return {
      id: "trial",
      trialEndsAt: current?.trialEndsAt ?? addDays(30),
    };
  }
  if (planId === "cancel") {
    const expires = current?.trialEndsAt ? new Date(current.trialEndsAt).getTime() : 0;
    const hasTrialLeft = expires > Date.now();
    return hasTrialLeft ? { id: "trial", trialEndsAt: current?.trialEndsAt } : { id: "expired" };
  }
  return { id: planId, trialEndsAt: undefined };
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
  const planMeta = buildPlanMeta(parsed.data.planId, currentPlan);

  const { error } = await supabase.auth.updateUser({
    data: { plan: { ...planMeta, updatedAt: new Date().toISOString() } },
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, plan: planMeta });
}

