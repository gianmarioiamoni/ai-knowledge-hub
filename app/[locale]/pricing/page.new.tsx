import type { JSX } from "react";
import { PricingPage } from "@/components/pricing";
import { getPricingLabels, buildPricingPlans } from "@/lib/server/pricingHelpers";

export const dynamic = "force-dynamic";

type PricingPageRouteProps = {
  params: Promise<{ locale: string }>;
};

export default async function PricingPageRoute({ params }: PricingPageRouteProps): Promise<JSX.Element> {
  const { locale } = await params;

  // Build plans
  const plans = await buildPricingPlans(locale);

  // Labels
  const labels = await getPricingLabels(locale);

  return <PricingPage plans={plans} labels={labels} />;
}

