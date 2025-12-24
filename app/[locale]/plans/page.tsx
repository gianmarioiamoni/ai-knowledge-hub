import { getTranslations } from "next-intl/server";
import { JSX } from "react";
import { PlansSection } from "@/components/subscriptions/PlansSection";
import type { Plan } from "@/components/subscriptions/PlansSection/types";
import type { PlanMetadata } from "@/lib/server/subscriptions";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import { setPlan } from "../profile/actions";

export default async function PlansPage({ params }: { params: Promise<{ locale: string }> }): Promise<JSX.Element> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "plans" });
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const planMeta = (data.user?.user_metadata as { plan?: PlanMetadata } | undefined)?.plan;
  const parsePlanId = (value?: string): Plan["id"] => {
    if (value === "smb" || value === "enterprise" || value === "trial") return value;
    return "trial";
  };
  const currentPlan = planMeta
    ? {
      planId: parsePlanId(planMeta.id),
      billingCycle: planMeta.billingCycle ?? "monthly",
    }
    : {
      planId: "trial" as Plan["id"],
      billingCycle: "monthly" as const,
    };

  const plans: Plan[] = [
    {
      id: "trial",
      name: t("trial.name"),
      description: t("trial.desc"),
      monthly: t("trial.price"),
      annual: t("trial.price"),
      limits: [
        t("trial.limits.docs"),
        t("trial.limits.chat"),
        t("trial.limits.procedures"),
      ],
    },
    {
      id: "smb",
      name: t("smb.name"),
      description: t("smb.desc"),
      monthly: t("smb.monthly"),
      annual: t("smb.annual"),
      limits: [t("smb.limits.docs"), t("smb.limits.chat"), t("smb.limits.procedures")],
      highlight: true,
    },
    {
      id: "enterprise",
      name: t("enterprise.name"),
      description: t("enterprise.desc"),
      monthly: t("enterprise.monthly"),
      annual: t("enterprise.annual"),
      limits: [
        t("enterprise.limits.docs"),
        t("enterprise.limits.chat"),
        t("enterprise.limits.procedures"),
        t("enterprise.limits.support"),
      ],
    },
  ];

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-12 sm:px-8 lg:px-0">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{t("title")}</p>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">{t("subtitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <PlansSection
        plans={plans}
        labels={{
          monthly: t("labels.monthly"),
          annual: t("labels.annual"),
          select: t("labels.select"),
          selected: t("labels.selected"),
        }}
        currentPlan={currentPlan}
        onSelect={async (planId, billingCycle) => {
          "use server";
          const formData = new FormData();
          formData.append("planId", planId);
          formData.append("billingCycle", billingCycle);
          await setPlan({}, formData);
        }}
      />
    </div>
  );
}

