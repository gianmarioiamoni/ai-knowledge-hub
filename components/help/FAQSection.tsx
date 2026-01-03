"use client";

import type { JSX } from "react";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LifeBuoyIcon } from "lucide-react";
import type { FAQItem } from "./types";

type FAQSectionProps = {
  title: string;
  items: FAQItem[];
};

export function FAQSection({ title, items }: FAQSectionProps): JSX.Element {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 pb-2">
        <LifeBuoyIcon className="size-5 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      </div>
      <Accordion type="single" collapsible className="w-full">
        {items.map((item, idx) => (
          <AccordionItem key={idx} value={`faq-${idx}`}>
            <AccordionTrigger className="text-left text-base font-semibold">{item.q}</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-6">{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Card>
  );
}

