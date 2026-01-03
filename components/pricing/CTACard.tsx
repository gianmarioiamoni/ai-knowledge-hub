"use client";

import type { JSX } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { PricingPageLabels } from "./types";

type CTACardProps = {
  cta: PricingPageLabels["cta"];
};

export function CTACard({ cta }: CTACardProps): JSX.Element {
  return (
    <Card className="flex flex-col gap-3 p-6">
      <h2 className="text-xl font-semibold text-foreground">{cta.title}</h2>
      <p className="text-sm text-muted-foreground">{cta.description}</p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/login">{cta.login}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/contact">{cta.contact}</Link>
        </Button>
      </div>
    </Card>
  );
}

