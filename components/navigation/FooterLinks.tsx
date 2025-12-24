"use client";

import { JSX } from "react";
import { Link } from "@/i18n/navigation";

type FooterLinksProps = {
  privacyLabel: string;
  cookiesLabel: string;
  cookiesHref?: string;
};

function FooterLinks({ privacyLabel, cookiesLabel, cookiesHref }: FooterLinksProps): JSX.Element {
  const openBanner = () => {
    const event = new Event("open-cookie-banner");
    window.dispatchEvent(event);
  };

  return (
    <div className="mx-auto flex max-w-6xl items-center justify-end gap-4 px-6 pb-6 text-sm text-muted-foreground">
      <Link href="/privacy" className="hover:text-foreground underline underline-offset-2">
        {privacyLabel}
      </Link>
      {cookiesHref ? (
        <a href={cookiesHref} className="hover:text-foreground underline underline-offset-2">
          {cookiesLabel}
        </a>
      ) : (
        <button type="button" className="hover:text-foreground underline underline-offset-2" onClick={openBanner}>
          {cookiesLabel}
        </button>
      )}
    </div>
  );
}

export { FooterLinks };

