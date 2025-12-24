"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/browser";
import { getCookieConsent } from "@/lib/client/cookieConsent";

type SentryClientInitProps = {
  dsn?: string;
  environment?: string;
  tracesSampleRate?: number;
};

function SentryClientInit({
  dsn = process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment = process.env.NODE_ENV,
  tracesSampleRate = 0.05,
}: SentryClientInitProps): null {
  useEffect(() => {
    if (!dsn) return;
    if (getCookieConsent() !== "accepted") return;
    if (Sentry.getCurrentHub().getClient()) return;
    Sentry.init({
      dsn,
      environment,
      tracesSampleRate,
    });
  }, [dsn, environment, tracesSampleRate]);

  return null;
}

export { SentryClientInit };

