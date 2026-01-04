import { getTranslations } from "next-intl/server";
import type { Plan } from "@/components/subscriptions/PlansSection/types";
import type { PricingPageLabels } from "@/components/pricing/types";

export async function getPricingLabels(locale: string): Promise<PricingPageLabels> {
  const t = await getTranslations({ locale, namespace: "pricing" });
  const tp = await getTranslations({ locale, namespace: "plans" });

  return {
    title: t("title"),
    subtitle: t("subtitle"),
    description: t("description"),
    noteTrial: t("noteTrial"),
    notePaid: t("notePaid"),
    cta: {
      title: t("cta.title"),
      description: t("cta.description"),
      login: t("cta.login"),
      contact: t("cta.contact"),
    },
    monthlyLabel: tp("labels.monthly"),
    annualLabel: tp("labels.annual"),
  };
}

export async function buildPricingPlans(locale: string): Promise<Plan[]> {
  const tp = await getTranslations({ locale, namespace: "plans" });

  return [
    {
      id: "trial",
      name: tp("trial.name"),
      description: tp("trial.desc"),
      monthly: tp("trial.price"),
      annual: tp("trial.price"),
      limits: [
        tp("trial.limits.users"),
        tp("trial.limits.docs"),
        tp("trial.limits.chat"),
        tp("trial.limits.procedures"),
      ],
    },
    {
      id: "smb",
      name: tp("smb.name"),
      description: tp("smb.desc"),
      monthly: tp("smb.monthly"),
      annual: tp("smb.annual"),
      limits: [
        tp("smb.limits.users"),
        tp("smb.limits.docs"),
        tp("smb.limits.chat"),
        tp("smb.limits.procedures"),
      ],
      highlight: true,
    },
    {
      id: "enterprise",
      name: tp("enterprise.name"),
      description: tp("enterprise.desc"),
      monthly: tp("enterprise.monthly"),
      annual: tp("enterprise.annual"),
      limits: [
        tp("enterprise.limits.users"),
        tp("enterprise.limits.docs"),
        tp("enterprise.limits.chat"),
        tp("enterprise.limits.procedures"),
        tp("enterprise.limits.support"),
      ],
    },
  ];
}

