import type { JSX } from "react";
import { redirect } from "@/i18n/navigation";
import { PricingPage } from "@/components/pricing";
import { getPricingLabels, buildPricingPlans } from "@/lib/server/pricingHelpers";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";

export const dynamic = "force-dynamic";

type PricingPageRouteProps = {
  params: Promise<{ locale: string }>;
};

export default async function PricingPageRoute({ params }: PricingPageRouteProps): Promise<JSX.Element> {
  const { locale } = await params;

  // Redirect authenticated users to /plans or /dashboard
  const supabase = createSupabaseServerClient(false);
  const { data } = await supabase.auth.getUser();
  
  if (data.user) {
    const role = (data.user.user_metadata as { role?: string } | null)?.role;
    // Redirect COMPANY_ADMIN to /plans, others to /dashboard
    if (role === "COMPANY_ADMIN") {
      redirect({ href: "/plans", locale });
    }
    redirect({ href: "/dashboard", locale });
  }

  // Build plans
  const plans = await buildPricingPlans(locale);

  // Labels
  const labels = await getPricingLabels(locale);

  return <PricingPage plans={plans} labels={labels} />;
}

