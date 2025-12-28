import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/server/supabaseService";
import { sendUserPlanReminder } from "@/lib/server/email";
import type { PlanMetadata } from "@/lib/server/subscriptions";
import { env } from "@/lib/env";

const DAY_MS = 86_400_000;

const getDaysLeft = (target?: string | null): number | null => {
  if (!target) return null;
  const diff = new Date(target).getTime() - Date.now();
  if (Number.isNaN(diff)) return null;
  return Math.ceil(diff / DAY_MS);
};

export async function GET(request: Request): Promise<NextResponse> {
  if (env.CRON_SECRET) {
    const headerSecret = request.headers.get("x-cron-secret");
    if (headerSecret !== env.CRON_SECRET) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const supabase = createSupabaseServiceClient();
  let page = 1;
  let processed = 0;

  // Paginate through users
  // Supabase defaults perPage 50; we set 100 for efficiency.
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    for (const user of data.users) {
      const meta = (user.user_metadata as { plan?: PlanMetadata } | null) ?? {};
      const plan = meta.plan ?? {};
      const targetDate = plan.renewalAt ?? plan.trialEndsAt ?? null;
      const daysLeft = getDaysLeft(targetDate);
      if (daysLeft === null) continue;
      const shouldSend3 = daysLeft === 3 && plan.reminder3DaysSent !== true;
      const shouldSend1 = daysLeft === 1 && plan.reminder1DaySent !== true;
      if ((!shouldSend3 && !shouldSend1) || !user.email) continue;

      const flagUpdates: Partial<PlanMetadata> = {};
      if (shouldSend3) flagUpdates.reminder3DaysSent = true;
      if (shouldSend1) flagUpdates.reminder1DaySent = true;

      // Send email
      await sendUserPlanReminder({
        to: user.email,
        daysLeft,
        planId: plan.id ?? null,
        renewalAt: targetDate,
      }).catch(() => {});

      // Update metadata flags
      const nextPlan: PlanMetadata = { ...plan, ...flagUpdates };
      const nextMeta = { ...(user.user_metadata ?? {}), plan: nextPlan };
      await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: nextMeta,
      });
    }

    processed += data.users.length;
    if (data.users.length < 100) break;
    page += 1;
  }

  return NextResponse.json({ ok: true, processed });
}


