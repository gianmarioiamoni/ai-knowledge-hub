import type { JSX } from "react";
import { HelpPage } from "@/components/help";
import { getManualUrl } from "@/components/help/helpers";
import { getHelpLabels } from "@/lib/server/helpHelpers";

export const dynamic = "force-dynamic";

type HelpPageRouteProps = {
  params: Promise<{ locale: string }>;
};

export default async function HelpPageRoute({ params }: HelpPageRouteProps): Promise<JSX.Element> {
  const { locale } = await params;

  // Labels
  const labels = await getHelpLabels(locale);

  // Manual URL
  const manualUrl = getManualUrl(locale);

  return <HelpPage labels={labels} manualUrl={manualUrl} />;
}

