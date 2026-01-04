import type { JSX } from "react";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import type { HelpPageLabels } from "./types";

type QuickLinksProps = {
  title: string;
  links: HelpPageLabels["quick"]["links"];
};

export function QuickLinks({ title, links }: QuickLinksProps): JSX.Element {
  const quickLinks = [
    { ...links.documents, href: "/documents" },
    { ...links.chat, href: "/chat" },
    { ...links.procedures, href: "/procedures" },
    { ...links.plans, href: "/plans" },
  ];

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {quickLinks.map((link, idx) => (
          <Link
            key={idx}
            href={link.href}
            className="rounded-lg border bg-white/70 p-4 text-sm leading-6 transition hover:-translate-y-0.5 hover:shadow-sm"
          >
            <p className="font-semibold text-foreground">{link.title}</p>
            <p className="text-muted-foreground">{link.body}</p>
          </Link>
        ))}
      </div>
    </Card>
  );
}

