"use client";

import { JSX } from "react";
import { Link } from "@/i18n/navigation";
import { LAYOUT_CLASSES } from "@/lib/styles/layout";

type FooterLinksProps = {
  privacyLabel: string;
  cookiesLabel: string;
  cookiesHref?: string;
  locale?: string;
  contactLabel?: string;
};

function FooterLinks({
  privacyLabel,
  cookiesLabel,
  cookiesHref,
  locale,
  contactLabel,
}: FooterLinksProps): JSX.Element {
  const openBanner = () => {
    const event = new Event("open-cookie-banner");
    window.dispatchEvent(event);
  };

  const privacyHref = "/privacy";
  const contactHref = "/contact";

  return (
    <div className={`mx-auto flex max-w-6xl items-center justify-end gap-4 ${LAYOUT_CLASSES.horizontalPadding} pb-6 text-sm text-muted-foreground`}>
      {contactLabel ? (
        <Link href={contactHref} className="hover:text-foreground underline underline-offset-2">
          {contactLabel}
        </Link>
      ) : null}
      <Link href={privacyHref} className="hover:text-foreground underline underline-offset-2">
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

