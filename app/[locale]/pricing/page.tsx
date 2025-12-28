import { getTranslations } from "next-intl/server";
import { JSX } from "react";
import type { Plan } from "@/components/subscriptions/PlansSection/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

type PricingPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PricingPage({ params }: PricingPageProps): Promise<JSX.Element> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pricing" });
  const tp = await getTranslations({ locale, namespace: "plans" });

  const plans: Plan[] = [
    {
      id: "trial",
      name: tp("trial.name"),
      description: tp("trial.desc"),
      monthly: tp("trial.price"),
      annual: tp("trial.price"),
      limits: [tp("trial.limits.docs"), tp("trial.limits.chat"), tp("trial.limits.procedures")],
    },
    {
      id: "smb",
      name: tp("smb.name"),
      description: tp("smb.desc"),
      monthly: tp("smb.monthly"),
      annual: tp("smb.annual"),
      limits: [tp("smb.limits.docs"), tp("smb.limits.chat"), tp("smb.limits.procedures")],
      highlight: true,
    },
    {
      id: "enterprise",
      name: tp("enterprise.name"),
      description: tp("enterprise.desc"),
      monthly: tp("enterprise.monthly"),
      annual: tp("enterprise.annual"),
      limits: [
        tp("enterprise.limits.docs"),
        tp("enterprise.limits.chat"),
        tp("enterprise.limits.procedures"),
        tp("enterprise.limits.support"),
      ],
    },
  ];

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{t("title")}</p>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">{t("subtitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`flex h-full flex-col gap-4 border border-white/50 bg-white/80 p-5 shadow-sm backdrop-blur transition ${
              plan.highlight ? "ring-2 ring-primary/60" : ""
            }`}
          >
            <div className="flex flex-col gap-1 min-h-[120px]">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">{plan.name}</p>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </div>
            <div className="flex items-baseline gap-3">
              <div className="flex flex-col">
                <p className="text-2xl font-semibold text-foreground">{plan.monthly}</p>
                <p className="text-xs text-muted-foreground">{tp("labels.monthly")}</p>
              </div>
              <div className="flex flex-col">
                <p className="text-2xl font-semibold text-foreground">{plan.annual}</p>
                <p className="text-xs text-muted-foreground">{tp("labels.annual")}</p>
              </div>
            </div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {plan.limits.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-[3px] inline-block h-2 w-2 rounded-full bg-primary/70" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-2">
              <div className="text-sm text-muted-foreground">
                {plan.id === "trial" ? t("noteTrial") : t("notePaid")}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="flex flex-col gap-3 p-6">
        <h2 className="text-xl font-semibold text-foreground">{t("cta.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("cta.description")}</p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/login">{t("cta.login")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contact">{t("cta.contact")}</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}


