"use client";

import type { JSX } from "react";
import { LifeBuoyIcon } from "lucide-react";
import { HelpCards } from "./HelpCards";
import { FAQSection } from "./FAQSection";
import { QuickLinks } from "./QuickLinks";
import type { HelpPageLabels } from "./types";

type HelpPageProps = {
  labels: HelpPageLabels;
  manualUrl: string;
};

export function HelpPage({ labels, manualUrl }: HelpPageProps): JSX.Element {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-12">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <LifeBuoyIcon className="size-6 text-primary" />
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{labels.title}</p>
        </div>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">{labels.subtitle}</h1>
        <p className="text-sm text-muted-foreground">{labels.description}</p>
      </div>

      {/* Help Cards */}
      <HelpCards labels={labels} manualUrl={manualUrl} />

      {/* FAQ Section */}
      <FAQSection title={labels.faq.title} items={labels.faq.items} />

      {/* Quick Links */}
      <QuickLinks title={labels.quick.title} links={labels.quick.links} />
    </div>
  );
}

