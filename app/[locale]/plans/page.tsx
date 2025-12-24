import { getTranslations } from "next-intl/server";
import { JSX } from "react";
import { PlansSection, type Plan } from "@/components/subscriptions/PlansSection";
import { setPlan } from "../profile/actions";

export default async function PlansPage({ params }: { params: Promise<{ locale: string }> }): Promise<JSX.Element> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "plans" });

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
        onSelect={async (planId) => {
          "use server";
          const formData = new FormData();
          formData.append("planId", planId);
          await setPlan({}, formData);
        }}
      />
    </div>
  );
}

