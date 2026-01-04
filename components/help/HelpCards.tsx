import type { JSX } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { BookOpenIcon, MailIcon, MessageCircleIcon } from "lucide-react";
import type { HelpPageLabels } from "./types";

type HelpCardsProps = {
  labels: HelpPageLabels;
  manualUrl: string;
};

export function HelpCards({ labels, manualUrl }: HelpCardsProps): JSX.Element {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Manual Card */}
      <Card className="flex flex-col gap-4 p-6">
        <div className="flex items-center gap-3">
          <BookOpenIcon className="size-5 text-primary" />
          <div>
            <p className="text-base font-semibold text-foreground">{labels.cards.manual.title}</p>
            <p className="text-sm text-muted-foreground">{labels.cards.manual.description}</p>
          </div>
        </div>
        <Button asChild className="w-fit">
          <Link href={manualUrl} target="_blank">
            {labels.cards.manual.cta}
          </Link>
        </Button>
      </Card>

      {/* Contact Card */}
      <Card className="flex flex-col gap-4 p-6">
        <div className="flex items-center gap-3">
          <MessageCircleIcon className="size-5 text-primary" />
          <div>
            <p className="text-base font-semibold text-foreground">{labels.cards.contact.title}</p>
            <p className="text-sm text-muted-foreground">{labels.cards.contact.description}</p>
          </div>
        </div>
        <Button asChild variant="secondary" className="w-fit">
          <Link href="/contact">{labels.cards.contact.cta}</Link>
        </Button>
      </Card>

      {/* Support Card */}
      <Card className="flex flex-col gap-4 p-6">
        <div className="flex items-center gap-3">
          <MailIcon className="size-5 text-primary" />
          <div>
            <p className="text-base font-semibold text-foreground">{labels.cards.support.title}</p>
            <p className="text-sm text-muted-foreground">{labels.cards.support.description}</p>
          </div>
        </div>
        <div className="text-sm text-muted-foreground leading-5">
          <p>{labels.cards.support.email}</p>
          <p>{labels.cards.support.sla}</p>
        </div>
      </Card>
    </div>
  );
}

