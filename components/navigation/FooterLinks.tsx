"use client";

import { JSX } from "react";
import { Link } from "@/i18n/navigation";

type FooterLinksProps = {
  privacyLabel: string;
  cookiesLabel: string;
  cookiesHref?: string;
};

function FooterLinks({ privacyLabel, cookiesLabel, cookiesHref = "/privacy" }: FooterLinksProps): JSX.Element {
  return (
    <div className="mx-auto flex max-w-6xl items-center justify-end gap-4 px-6 pb-6 text-sm text-muted-foreground">
      <Link href="/privacy" className="hover:text-foreground underline underline-offset-2">
        {privacyLabel}
      </Link>
      <a href={cookiesHref} className="hover:text-foreground underline underline-offset-2">
        {cookiesLabel}
      </a>
    </div>
  );
}

export { FooterLinks };

