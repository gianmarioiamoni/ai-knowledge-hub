"use client";

import type { JSX } from "react";
import type { Plan } from "@/components/subscriptions/PlansSection/types";
import { PricingCards } from "./PricingCards";
import { CTACard } from "./CTACard";
import type { PricingPageLabels } from "./types";

type PricingPageProps = {
  plans: Plan[];
  labels: PricingPageLabels;
};

export function PricingPage({ plans, labels }: PricingPageProps): JSX.Element {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-12">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{labels.title}</p>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">{labels.subtitle}</h1>
        <p className="text-sm text-muted-foreground">{labels.description}</p>
      </div>

      {/* Pricing Cards */}
      <PricingCards
        plans={plans}
        monthlyLabel={labels.monthlyLabel}
        annualLabel={labels.annualLabel}
        noteTrial={labels.noteTrial}
        notePaid={labels.notePaid}
      />

      {/* CTA Card */}
      <CTACard cta={labels.cta} />
    </div>
  );
}

